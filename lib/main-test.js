"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const api_1 = __importDefault(require("./api"));
const main_1 = require("./main");
const node_fetch_1 = require("node-fetch");
ava_1.default('commitForRelease()', (t) => {
    t.is(main_1.commitForRelease('This is a fixed commit message', {
        formulaName: 'test formula',
    }), 'This is a fixed commit message');
    t.is(main_1.commitForRelease('chore({{formulaName}}): version {{version}}', {
        formulaName: 'test formula',
    }), 'chore(test formula): version {{version}}');
    t.is(main_1.commitForRelease('{formulaName} {version}', {
        formulaName: 'test formula',
        version: 'v1.2.3',
    }), '{formulaName} {version}');
    t.is(main_1.commitForRelease('chore({{formulaName}}): upgrade to version {{version}}', {
        formulaName: 'test formula',
        version: 'v1.2.3',
    }), 'chore(test formula): upgrade to version v1.2.3');
    t.is(main_1.commitForRelease('{{formulaName}} {{version}}: upgrade {{formulaName}} to version {{version}}', {
        formulaName: 'test formula',
        version: 'v1.2.3',
    }), 'test formula v1.2.3: upgrade test formula to version v1.2.3');
    t.is(main_1.commitForRelease('{{constructor}}{{__proto__}}', {}), '{{constructor}}{{__proto__}}');
    t.is(main_1.commitForRelease('{{version}}', { version: 'v{{version}}' }), 'v{{version}}');
});
ava_1.default('prepareEdit()', async (t) => {
    const ctx = {
        sha: 'TAGSHA',
        ref: 'refs/tags/v0.8.2',
        repo: {
            owner: 'OWNER',
            repo: 'REPO',
        },
    };
    process.env['INPUT_HOMEBREW-TAP'] = 'Homebrew/homebrew-core';
    process.env['INPUT_COMMIT-MESSAGE'] = 'Upgrade {{formulaName}} to {{version}}';
    // FIXME: this tests results in a live HTTP request. Figure out how to stub the `stream()` method in
    // calculate-download-checksum.
    const stubbedFetch = function (url) {
        if (url == 'https://api.github.com/repos/OWNER/REPO/tarball/v0.8.2') {
            return Promise.resolve(new node_fetch_1.Response('', {
                status: 301,
                headers: {
                    Location: 'https://github.com/mislav/bump-homebrew-formula-action/archive/v1.9.tar.gz',
                },
            }));
        }
        throw url;
    };
    const apiClient = api_1.default('ATOKEN', { fetch: stubbedFetch, logRequests: false });
    const opts = await main_1.prepareEdit(ctx, apiClient, apiClient);
    t.is(opts.owner, 'Homebrew');
    t.is(opts.repo, 'homebrew-core');
    t.is(opts.branch, '');
    t.is(opts.filePath, 'Formula/repo.rb');
    t.is(opts.commitMessage, 'Upgrade repo to 0.8.2');
    const oldFormula = `
    class MyProgram < Formula
      url "OLDURL"
      sha256 "OLDSHA"
      revision 12
      head "git://example.com/repo.git",
        revision: "GITSHA"
    end
  `;
    t.is(`
    class MyProgram < Formula
      url "https://github.com/OWNER/REPO/archive/v0.8.2.tar.gz"
      sha256 "c036fbc44901b266f6d408d6ca36ba56f63c14cc97994a935fb9741b55edee83"
      head "git://example.com/repo.git",
        revision: "GITSHA"
    end
  `, opts.replace(oldFormula));
});
