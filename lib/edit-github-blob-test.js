"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const api_1 = __importDefault(require("./api"));
const node_fetch_1 = require("node-fetch");
const edit_github_blob_1 = __importDefault(require("./edit-github-blob"));
function replyJSON(status, body) {
    return Promise.resolve(new node_fetch_1.Response(JSON.stringify(body), {
        status,
        headers: {
            'Content-Type': 'application/json',
        },
    }));
}
ava_1.default('edit-github-blob direct push', async (t) => {
    const stubbedFetch = function (url, options) {
        function route(method, path) {
            return (method.toUpperCase() === options.method.toUpperCase() &&
                `https://api.github.com/${path}` === url);
        }
        if (route('GET', 'repos/OWNER/REPO')) {
            return replyJSON(200, {
                default_branch: 'main',
                permissions: { push: true },
            });
        }
        else if (route('GET', 'repos/OWNER/REPO/branches/main')) {
            return replyJSON(200, {
                commit: { sha: 'COMMITSHA' },
                protected: false,
            });
        }
        else if (route('GET', 'repos/OWNER/REPO/contents/formula%2Ftest.rb?ref=main')) {
            return replyJSON(200, {
                content: Buffer.from(`old content`).toString('base64'),
            });
        }
        else if (route('PUT', 'repos/OWNER/REPO/contents/formula%2Ftest.rb')) {
            const payload = JSON.parse(options.body || '');
            t.is('main', payload.branch);
            t.is('Update formula/test.rb', payload.message);
            t.is('OLD CONTENT', Buffer.from(payload.content, 'base64').toString('utf8'));
            return replyJSON(200, {
                commit: { html_url: 'https://github.com/OWNER/REPO/commit/NEWSHA' },
            });
        }
        throw `not stubbed: ${options.method} ${url}`;
    };
    const url = await edit_github_blob_1.default({
        apiClient: api_1.default('ATOKEN', { fetch: stubbedFetch, logRequests: false }),
        owner: 'OWNER',
        repo: 'REPO',
        filePath: 'formula/test.rb',
        replace: (oldContent) => oldContent.toUpperCase(),
    });
    t.is('https://github.com/OWNER/REPO/commit/NEWSHA', url);
});
ava_1.default('edit-github-blob via pull request', async (t) => {
    let newBranchName;
    const stubbedFetch = function (url, options) {
        function route(method, path) {
            return (method.toUpperCase() === options.method.toUpperCase() &&
                `https://api.github.com/${path}` === url);
        }
        if (route('GET', 'repos/OWNER/REPO')) {
            return replyJSON(200, {
                default_branch: 'main',
                permissions: { push: false },
            });
        }
        else if (route('GET', 'repos/OWNER/REPO/branches/main')) {
            return replyJSON(200, {
                commit: { sha: 'COMMITSHA' },
                protected: false,
            });
        }
        else if (route('POST', 'repos/OWNER/REPO/forks')) {
            return replyJSON(200, {});
        }
        else if (route('GET', 'user')) {
            return replyJSON(200, { login: 'FORKOWNER' });
        }
        else if (route('POST', 'repos/FORKOWNER/REPO/merge-upstream')) {
            const payload = JSON.parse(options.body || '');
            t.is('main', payload.branch);
            return replyJSON(409, {});
        }
        else if (route('POST', 'repos/FORKOWNER/REPO/git/refs')) {
            const payload = JSON.parse(options.body || '');
            t.regex(payload.ref, /^refs\/heads\/update-test\.rb-\d+$/);
            newBranchName = payload.ref.replace('refs/heads/', '');
            t.is('COMMITSHA', payload.sha);
            return replyJSON(201, {});
        }
        else if (route('GET', `repos/FORKOWNER/REPO/contents/formula%2Ftest.rb?ref=${newBranchName}`)) {
            return replyJSON(200, {
                content: Buffer.from(`old content`).toString('base64'),
            });
        }
        else if (route('PUT', 'repos/FORKOWNER/REPO/contents/formula%2Ftest.rb')) {
            const payload = JSON.parse(options.body || '');
            t.is(newBranchName, payload.branch);
            t.is('Update formula/test.rb', payload.message);
            t.is('OLD CONTENT', Buffer.from(payload.content, 'base64').toString('utf8'));
            return replyJSON(200, {
                commit: { html_url: 'https://github.com/OWNER/REPO/commit/NEWSHA' },
            });
        }
        else if (route('POST', 'repos/OWNER/REPO/pulls')) {
            const payload = JSON.parse(options.body || '');
            t.is('main', payload.base);
            t.is(`FORKOWNER:${newBranchName}`, payload.head);
            t.is('Update formula/test.rb', payload.title);
            t.is('', payload.body);
            return replyJSON(201, {
                html_url: 'https://github.com/OWNER/REPO/pull/123',
            });
        }
        throw `not stubbed: ${options.method} ${url}`;
    };
    const url = await edit_github_blob_1.default({
        apiClient: api_1.default('ATOKEN', { fetch: stubbedFetch, logRequests: false }),
        owner: 'OWNER',
        repo: 'REPO',
        filePath: 'formula/test.rb',
        replace: (oldContent) => oldContent.toUpperCase(),
    });
    t.is('https://github.com/OWNER/REPO/pull/123', url);
});
ava_1.default('edit-github-blob with pushTo', async (t) => {
    let newBranchName;
    const stubbedFetch = function (url, options) {
        function route(method, path) {
            return (method.toUpperCase() === options.method.toUpperCase() &&
                `https://api.github.com/${path}` === url);
        }
        if (route('GET', 'repos/OWNER/REPO')) {
            return replyJSON(200, {
                default_branch: 'main',
                permissions: { push: false },
            });
        }
        else if (route('GET', 'repos/OWNER/REPO/branches/main')) {
            return replyJSON(200, {
                commit: { sha: 'COMMITSHA' },
                protected: false,
            });
        }
        else if (route('POST', 'repos/FORKOWNER/REPO/merge-upstream')) {
            const payload = JSON.parse(options.body || '');
            t.is('main', payload.branch);
            return replyJSON(409, {});
        }
        else if (route('POST', 'repos/FORKOWNER/REPO/git/refs')) {
            const payload = JSON.parse(options.body || '');
            t.regex(payload.ref, /^refs\/heads\/update-test\.rb-\d+$/);
            newBranchName = payload.ref.replace('refs/heads/', '');
            t.is('COMMITSHA', payload.sha);
            return replyJSON(201, {});
        }
        else if (route('GET', `repos/FORKOWNER/REPO/contents/formula%2Ftest.rb?ref=${newBranchName}`)) {
            return replyJSON(200, {
                content: Buffer.from(`old content`).toString('base64'),
            });
        }
        else if (route('PUT', 'repos/FORKOWNER/REPO/contents/formula%2Ftest.rb')) {
            const payload = JSON.parse(options.body || '');
            t.is(newBranchName, payload.branch);
            t.is('Update formula/test.rb', payload.message);
            t.is('OLD CONTENT', Buffer.from(payload.content, 'base64').toString('utf8'));
            return replyJSON(200, {
                commit: { html_url: 'https://github.com/OWNER/REPO/commit/NEWSHA' },
            });
        }
        else if (route('POST', 'repos/OWNER/REPO/pulls')) {
            const payload = JSON.parse(options.body || '');
            t.is('main', payload.base);
            t.is(`FORKOWNER:${newBranchName}`, payload.head);
            t.is('Update formula/test.rb', payload.title);
            t.is('', payload.body);
            return replyJSON(201, {
                html_url: 'https://github.com/OWNER/REPO/pull/123',
            });
        }
        throw `not stubbed: ${options.method} ${url}`;
    };
    const url = await edit_github_blob_1.default({
        apiClient: api_1.default('ATOKEN', { fetch: stubbedFetch, logRequests: false }),
        owner: 'OWNER',
        repo: 'REPO',
        pushTo: { owner: 'FORKOWNER', repo: 'REPO' },
        filePath: 'formula/test.rb',
        replace: (oldContent) => oldContent.toUpperCase(),
    });
    t.is('https://github.com/OWNER/REPO/pull/123', url);
});
