"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelExporter = void 0;
const common_1 = require("@nestjs/common");
const exceljs_1 = __importDefault(require("exceljs"));
let ExcelExporter = class ExcelExporter {
    async exportContacts(contacts) {
        const workbook = new exceljs_1.default.Workbook();
        const sheet = workbook.addWorksheet('Contacts');
        sheet.columns = [
            { header: 'Email', key: 'email', width: 35 },
            { header: 'Source', key: 'source', width: 12 },
            { header: 'Source Detail', key: 'sourceDetail', width: 30 },
            { header: 'Status', key: 'status', width: 12 },
            { header: 'Is Working', key: 'isWorking', width: 12 },
            { header: 'Name', key: 'name', width: 20 },
            { header: 'Company', key: 'company', width: 25 },
            { header: 'Checked At', key: 'checkedAt', width: 22 },
            { header: 'Last Error', key: 'lastError', width: 30 },
            { header: 'Created At', key: 'createdAt', width: 22 },
        ];
        for (const c of contacts) {
            sheet.addRow({
                email: c.email,
                source: c.source,
                sourceDetail: c.sourceDetail ?? '',
                status: c.status,
                isWorking: c.isWorking === null ? 'неизвестно' : c.isWorking ? 'да' : 'нет',
                name: c.name ?? '',
                company: c.company ?? '',
                checkedAt: c.checkedAt?.toISOString() ?? '',
                lastError: c.lastError ?? '',
                createdAt: c.createdAt.toISOString(),
            });
        }
        sheet.getRow(1).font = { bold: true };
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
};
exports.ExcelExporter = ExcelExporter;
exports.ExcelExporter = ExcelExporter = __decorate([
    (0, common_1.Injectable)()
], ExcelExporter);
//# sourceMappingURL=excel.exporter.js.map