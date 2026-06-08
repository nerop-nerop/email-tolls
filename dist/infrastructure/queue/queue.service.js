"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bullmq_1 = require("bullmq");
let QueueService = class QueueService {
    config;
    connection;
    validateQueue;
    sendQueue;
    workers = [];
    constructor(config) {
        this.config = config;
        const enabled = config.get('REDIS_ENABLED', 'true') !== 'false';
        if (enabled) {
            const redisUrl = config.get('REDIS_URL', 'redis://localhost:6379');
            const parsed = new URL(redisUrl);
            this.connection = {
                host: parsed.hostname || 'localhost',
                port: Number(parsed.port || 6379),
            };
            this.validateQueue = new bullmq_1.Queue('email-validate', {
                connection: this.connection,
            });
            this.sendQueue = new bullmq_1.Queue('email-send', {
                connection: this.connection,
            });
        }
        else {
            this.connection = null;
            this.validateQueue = null;
            this.sendQueue = null;
        }
    }
    createValidateWorker(processor) {
        if (!this.connection)
            return null;
        const concurrency = Number(this.config.get('EMAIL_VALIDATE_CONCURRENCY', 10));
        const worker = new bullmq_1.Worker('email-validate', processor, {
            connection: this.connection,
            concurrency,
        });
        this.workers.push(worker);
        return worker;
    }
    createSendWorker(processor) {
        if (!this.connection)
            return null;
        const worker = new bullmq_1.Worker('email-send', processor, {
            connection: this.connection,
            concurrency: 1,
            limiter: {
                max: 1,
                duration: Number(this.config.get('EMAIL_SEND_DELAY_MS', 3000)),
            },
        });
        this.workers.push(worker);
        return worker;
    }
    async onModuleDestroy() {
        await Promise.all(this.workers.map((w) => w.close()));
        await this.validateQueue?.close();
        await this.sendQueue?.close();
    }
};
exports.QueueService = QueueService;
exports.QueueService = QueueService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], QueueService);
//# sourceMappingURL=queue.service.js.map