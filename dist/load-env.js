"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadEnv = loadEnv;
const dotenv_1 = require("dotenv");
const fs_1 = require("fs");
const path_1 = require("path");
const app_path_1 = require("./app-path");
function loadEnv() {
    const root = (0, app_path_1.getAppRoot)();
    const envPath = (0, path_1.resolve)(root, '.env');
    const envExamplePath = (0, path_1.resolve)(root, '.env.example');
    if ((0, fs_1.existsSync)(envPath)) {
        (0, dotenv_1.config)({ path: envPath });
    }
    else if ((0, fs_1.existsSync)(envExamplePath)) {
        (0, dotenv_1.config)({ path: envExamplePath });
    }
    const useSqlite = !process.env.DATABASE_URL ||
        process.env.DATABASE_URL.startsWith('file:');
    if (useSqlite) {
        const dataDir = (0, path_1.join)(root, 'data');
        if (!(0, fs_1.existsSync)(dataDir)) {
            (0, fs_1.mkdirSync)(dataDir, { recursive: true });
        }
        const dbFile = (0, path_1.join)(dataDir, 'app.db');
        process.env.DATABASE_URL = `file:${dbFile}`;
    }
    if ((0, app_path_1.isPackaged)()) {
        const enginePath = (0, path_1.join)(root, 'prisma', 'query_engine-windows.dll.node');
        if ((0, fs_1.existsSync)(enginePath)) {
            process.env.PRISMA_QUERY_ENGINE_LIBRARY = enginePath;
        }
        process.env.REDIS_ENABLED ??= 'false';
        process.env.EMAIL_TOOL_PORT ??= '3001';
    }
}
//# sourceMappingURL=load-env.js.map