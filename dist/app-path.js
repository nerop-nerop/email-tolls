"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPackaged = isPackaged;
exports.getAppRoot = getAppRoot;
const fs_1 = require("fs");
const path_1 = require("path");
function isPackaged() {
    return Boolean(process.pkg);
}
function getAppRoot() {
    if (process.env.POPPD_ROOT) {
        return process.env.POPPD_ROOT;
    }
    if (isPackaged()) {
        return (0, path_1.dirname)(process.execPath);
    }
    let dir = __dirname;
    for (let i = 0; i < 8; i++) {
        if ((0, fs_1.existsSync)((0, path_1.resolve)(dir, 'package.json')) &&
            (0, fs_1.existsSync)((0, path_1.resolve)(dir, 'apps/mobile')) &&
            (0, fs_1.existsSync)((0, path_1.resolve)(dir, 'packages/database'))) {
            return dir;
        }
        dir = (0, path_1.resolve)(dir, '..');
    }
    return process.cwd();
}
//# sourceMappingURL=app-path.js.map