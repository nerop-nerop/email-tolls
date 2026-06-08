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
exports.FileParser = void 0;
const common_1 = require("@nestjs/common");
const exceljs_1 = __importDefault(require("exceljs"));
const email_regex_util_1 = require("./email-regex.util");
let FileParser = class FileParser {
    async parseBuffer(buffer, filename, skipSupport = true) {
        const ext = filename.split('.').pop()?.toLowerCase() ?? '';
        if (ext === 'xlsx' || ext === 'xls') {
            return this.parseExcel(buffer, skipSupport);
        }
        return this.parseText(buffer.toString('utf-8'), skipSupport);
    }
    async parseExcel(buffer, skipSupport) {
        const workbook = new exceljs_1.default.Workbook();
        await workbook.xlsx.load(buffer);
        const results = [];
        const seen = new Set();
        for (const sheet of workbook.worksheets) {
            sheet.eachRow((row) => {
                const cells = [];
                row.eachCell((cell) => {
                    const val = cell.text?.trim();
                    if (val)
                        cells.push(val);
                });
                const line = cells.join(' ');
                const emails = (0, email_regex_util_1.extractEmailsFromText)(line);
                for (const raw of emails) {
                    const email = (0, email_regex_util_1.normalizeEmail)(raw);
                    if (skipSupport && (0, email_regex_util_1.shouldSkipEmail)(email))
                        continue;
                    if (seen.has(email))
                        continue;
                    seen.add(email);
                    const nameCol = cells.find((c) => !c.includes('@'));
                    results.push({ email, name: nameCol });
                }
            });
        }
        return results;
    }
    parseText(text, skipSupport) {
        const results = [];
        const seen = new Set();
        for (const raw of (0, email_regex_util_1.extractEmailsFromText)(text)) {
            const email = (0, email_regex_util_1.normalizeEmail)(raw);
            if (skipSupport && (0, email_regex_util_1.shouldSkipEmail)(email))
                continue;
            if (seen.has(email))
                continue;
            seen.add(email);
            results.push({ email });
        }
        return results;
    }
};
exports.FileParser = FileParser;
exports.FileParser = FileParser = __decorate([
    (0, common_1.Injectable)()
], FileParser);
//# sourceMappingURL=file.parser.js.map