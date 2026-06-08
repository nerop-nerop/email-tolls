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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const excel_exporter_1 = require("./excel.exporter");
let ExportController = class ExportController {
    prisma;
    exporter;
    constructor(prisma, exporter) {
        this.prisma = prisma;
        this.exporter = exporter;
    }
    async export(res, isWorking, source) {
        const contacts = await this.prisma.emailContact.findMany({
            where: {
                ...(isWorking === 'true' && { isWorking: true }),
                ...(isWorking === 'false' && { isWorking: false }),
                ...(source && { source }),
            },
            orderBy: { createdAt: 'desc' },
        });
        const buffer = await this.exporter.exportContacts(contacts);
        const date = new Date().toISOString().slice(0, 10);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="contacts_${date}.xlsx"`);
        res.send(buffer);
    }
};
exports.ExportController = ExportController;
__decorate([
    (0, common_1.Get)('export'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('isWorking')),
    __param(2, (0, common_1.Query)('source')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ExportController.prototype, "export", null);
exports.ExportController = ExportController = __decorate([
    (0, common_1.Controller)('contacts'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        excel_exporter_1.ExcelExporter])
], ExportController);
//# sourceMappingURL=export.controller.js.map