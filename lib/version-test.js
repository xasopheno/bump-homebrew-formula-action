"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const version_1 = require("./version");
ava_1.default('fromUrl()', (t) => {
    t.is(version_1.fromUrl('https://github.com/me/myproject/archive/v1.2.3.tar.gz'), 'v1.2.3');
    t.is(version_1.fromUrl('https://github.com/me/myproject/releases/download/v1.2.3/file.tgz'), 'v1.2.3');
    t.is(version_1.fromUrl('http://myproject.net/download/v1.2.3.tgz'), 'v1.2.3');
    t.is(version_1.fromUrl('https://example.com/v1.2.3.zip'), 'v1.2.3');
});
