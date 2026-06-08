"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const child_process_1 = require("child_process");
const helmet_1 = __importDefault(require("helmet"));
const fs_1 = require("fs");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const app_path_1 = require("./app-path");
const load_env_1 = require("./load-env");
(0, load_env_1.loadEnv)();
function resolvePublicDir() {
    const external = (0, path_1.join)((0, app_path_1.getAppRoot)(), 'public');
    if ((0, fs_1.existsSync)(external)) {
        return external;
    }
    return (0, path_1.join)(__dirname, 'public');
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.use((0, helmet_1.default)({ contentSecurityPolicy: false }));
    app.enableCors({ origin: true, credentials: true });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.setGlobalPrefix('api');
    app.useStaticAssets(resolvePublicDir());
    const port = Number(process.env.EMAIL_TOOL_PORT ?? 3001);
    await app.listen(port, '0.0.0.0');
    const url = `http://localhost:${port}`;
    console.log(`Poppd Email Tool: ${url}`);
    if ((0, app_path_1.isPackaged)()) {
        (0, child_process_1.exec)(`start ${url}`);
    }
}
void bootstrap();
//# sourceMappingURL=main.js.map