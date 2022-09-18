"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const url_1 = require("url");
const calculate_download_checksum_1 = require("./calculate-download-checksum");
ava_1.default('calculate-download-checksum parseArchiveUrl', (t) => {
    const tests = [
        {
            url: 'https://github.com/mislav/will_paginate/archive/v3.3.1.zip',
            wants: {
                owner: 'mislav',
                repo: 'will_paginate',
                ref: 'v3.3.1',
                ext: '.zip',
            },
        },
        {
            url: 'https://github.com/cli/cli/archive/refs/tags/v2.13.0.tar.gz',
            wants: {
                owner: 'cli',
                repo: 'cli',
                ref: 'refs/tags/v2.13.0',
                ext: '.tar.gz',
            },
        },
        {
            url: 'https://github.com/john-u/smartthings-cli/archive/refs/tags/@smartthings/cli@1.0.0-beta.9.tar.gz',
            wants: {
                owner: 'john-u',
                repo: 'smartthings-cli',
                ref: 'refs/tags/@smartthings/cli@1.0.0-beta.9',
                ext: '.tar.gz',
            },
        },
    ];
    tests.forEach((tt) => {
        const archive = calculate_download_checksum_1.parseArchiveUrl(new url_1.URL(tt.url));
        if (archive == null) {
            t.fail(`did not match: ${tt.url}`);
            return;
        }
        t.is(tt.wants.owner, archive.owner);
        t.is(tt.wants.repo, archive.repo);
        t.is(tt.wants.ref, archive.ref);
        t.is(tt.wants.ext, archive.ext);
    });
});
ava_1.default('calculate-download-checksum parseReleaseDownloadUrl', (t) => {
    const tests = [
        {
            url: 'https://github.com/john-u/smartthings-cli/releases/download/%40smartthings%2Fcli%401.0.0-beta.9/smartthings-macos.tar.gz',
            wants: {
                owner: 'john-u',
                repo: 'smartthings-cli',
                tagname: '@smartthings/cli@1.0.0-beta.9',
                name: 'smartthings-macos.tar.gz',
            },
        },
        {
            url: 'https://github.com/john-u/smartthings-cli/releases/download/@smartthings/cli@1.0.0-beta.9/smartthings-macos.tar.gz',
            wants: {
                owner: 'john-u',
                repo: 'smartthings-cli',
                tagname: '@smartthings/cli@1.0.0-beta.9',
                name: 'smartthings-macos.tar.gz',
            },
        },
    ];
    tests.forEach((tt) => {
        const asset = calculate_download_checksum_1.parseReleaseDownloadUrl(new url_1.URL(tt.url));
        if (asset == null) {
            t.fail(`did not match: ${tt.url}`);
            return;
        }
        t.is(tt.wants.owner, asset.owner);
        t.is(tt.wants.repo, asset.repo);
        t.is(tt.wants.tagname, asset.tagname);
        t.is(tt.wants.name, asset.name);
    });
});
