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
exports.ValidatorService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const queue_service_1 = require("../../infrastructure/queue/queue.service");
const email_validator_service_1 = require("./email-validator.service");
let ValidatorService = class ValidatorService {
    prisma;
    emailValidator;
    queue;
    constructor(prisma, emailValidator, queue) {
        this.prisma = prisma;
        this.emailValidator = emailValidator;
        this.queue = queue;
    }
    onModuleInit() {
        this.queue.createValidateWorker(async (job) => {
            await this.processContact(job);
        });
    }
    async validateAllPending() {
        const pending = await this.prisma.emailContact.findMany({
            where: { status: 'pending' },
            select: { id: true },
        });
        if (this.queue.validateQueue) {
            for (const contact of pending) {
                await this.queue.validateQueue.add('validate', { contactId: contact.id });
            }
            return { queued: pending.length, processed: 0 };
        }
        for (const contact of pending) {
            await this.processContact({ data: { contactId: contact.id } });
        }
        return { queued: 0, processed: pending.length };
    }
    async validateContact(contactId) {
        if (this.queue.validateQueue) {
            await this.queue.validateQueue.add('validate', { contactId });
            return;
        }
        await this.processContact({ data: { contactId } });
    }
    async processContact(job) {
        const contact = await this.prisma.emailContact.findUnique({
            where: { id: job.data.contactId },
        });
        if (!contact)
            return;
        const result = await this.emailValidator.validate(contact.email);
        await this.prisma.emailContact.update({
            where: { id: contact.id },
            data: {
                status: result.status,
                isWorking: result.isWorking,
                checkedAt: new Date(),
                lastError: result.lastError,
            },
        });
    }
};
exports.ValidatorService = ValidatorService;
exports.ValidatorService = ValidatorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        email_validator_service_1.EmailValidatorService,
        queue_service_1.QueueService])
], ValidatorService);
//# sourceMappingURL=validator.service.js.map