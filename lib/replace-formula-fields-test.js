"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = __importDefault(require("ava"));
const replace_formula_fields_1 = require("./replace-formula-fields");
ava_1.default('replaceFields()', (t) => {
    const input = `
  url "https://github.com/old/url.git",
    tag: 'v0.9.0',
    revision => "OLDREV"
`;
    const expected = `
  url "https://github.com/cli/cli.git",
    tag: 'v0.11.1',
    revision => "NEWREV"
`;
    const replacements = new Map();
    replacements.set('url', 'https://github.com/cli/cli.git');
    replacements.set('tag', 'v0.11.1');
    replacements.set('revision', 'NEWREV');
    t.is(replace_formula_fields_1.replaceFields(input, replacements), expected);
});
