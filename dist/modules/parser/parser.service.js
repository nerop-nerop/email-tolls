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
exports.ParserService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
const file_parser_1 = require("./file.parser");
const html_parser_1 = require("./html.parser");
let ParserService = class ParserService {
    fileParser;
    htmlParser;
    prisma;
    constructor(fileParser, htmlParser, prisma) {
        this.fileParser = fileParser;
        this.htmlParser = htmlParser;
        this.prisma = prisma;
    }
    async importFromFile(buffer, filename, skipSupport = true) {
        const parsed = await this.fileParser.parseBuffer(buffer, filename, skipSupport);
        return this.saveContacts(parsed, 'file', filename);
    }
    async importFromUrls(urls, skipSupport = true) {
        const parsed = await this.htmlParser.parseUrls(urls, skipSupport);
        return this.saveContacts(parsed, 'url', urls.join(', '));
    }
    async saveContacts(items, source, sourceDetail) {
        let imported = 0;
        let skipped = 0;
        for (const item of items) {
            try {
                await this.prisma.emailContact.create({
                    data: {
                        email: item.email,
                        source,
                        sourceDetail: item.company ?? sourceDetail,
                        name: item.name,
                        company: item.company,
                        status: 'pending',
                    },
                });
                imported++;
            }
            catch {
                skipped++;
            }
        }
        return { imported, skipped, total: items.length };
    }
};
exports.ParserService = ParserService;
exports.ParserService = ParserService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [file_parser_1.FileParser,
        html_parser_1.HtmlParser,
        prisma_service_1.PrismaService])
], ParserService);
//# sourceMappingURL=parser.service.js.map