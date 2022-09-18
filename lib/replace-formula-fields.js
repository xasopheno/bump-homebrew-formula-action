"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeRevisionLine = exports.replaceFields = exports.UpgradeError = void 0;
const version_1 = require("./version");
class UpgradeError extends Error {
}
exports.UpgradeError = UpgradeError;
function assertNewer(v1, v2) {
    const c = version_1.compare(v1, v2);
    if (c == 0) {
        throw new UpgradeError(`the formula is already at version '${v1}'`);
    }
    else if (c == -1) {
        throw new UpgradeError(`the formula version '${v2}' is newer than '${v1}'`);
    }
}
function escape(value, char) {
    return value.replace(new RegExp(`\\${char}`, 'g'), `\\${char}`);
}
function replaceFields(oldContent, replacements) {
    let newContent = oldContent;
    for (const [field, value] of replacements) {
        newContent = newContent.replace(new RegExp(`^(\\s*)${field}((?::| *=>)? *)(['"])([^'"]+)\\3`, 'm'), (_, indent, sep, q, old) => {
            if (field == 'version')
                assertNewer(value, old);
            else if (field == 'url' && !value.endsWith('.git'))
                assertNewer(version_1.fromUrl(value), version_1.fromUrl(old));
            return `${indent}${field}${sep}${q}${escape(value, q)}${q}`;
        });
    }
    return newContent;
}
exports.replaceFields = replaceFields;
function removeRevisionLine(oldContent) {
    return oldContent.replace(/^[ \t]*revision \d+ *\r?\n/m, '');
}
exports.removeRevisionLine = removeRevisionLine;
