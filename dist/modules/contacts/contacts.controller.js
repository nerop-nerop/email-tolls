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
exports.ContactsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const parser_service_1 = require("../parser/parser.service");
const validator_service_1 = require("../validator/validator.service");
const import_urls_dto_1 = require("./dto/import-urls.dto");
const common_2 = require("@nestjs/common");
const contacts_service_1 = require("./contacts.service");
let ContactsController = class ContactsController {
    parser;
    validator;
    contacts;
    constructor(parser, validator, contacts) {
        this.parser = parser;
        this.validator = validator;
        this.contacts = contacts;
    }
    list(isWorking, source, status) {
        return this.contacts.list({
            isWorking: isWorking === 'true' ? true : isWorking === 'false' ? false : undefined,
            source,
            status,
        });
    }
    stats() {
        return this.contacts.stats();
    }
    async importFile(file) {
        if (!file) {
            return { error: 'No file uploaded' };
        }
        return this.parser.importFromFile(file.buffer, file.originalname);
    }
    importUrls(dto) {
        return this.parser.importFromUrls(dto.urls, dto.skipSupport ?? true);
    }
    validate() {
        return this.validator.validateAllPending();
    }
};
exports.ContactsController = ContactsController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('isWorking')),
    __param(1, (0, common_1.Query)('source')),
    __param(2, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "stats", null);
__decorate([
    (0, common_1.Post)('import/file'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ContactsController.prototype, "importFile", null);
__decorate([
    (0, common_1.Post)('import/urls'),
    __param(0, (0, common_2.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [import_urls_dto_1.ImportUrlsDto]),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "importUrls", null);
__decorate([
    (0, common_1.Post)('validate'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContactsController.prototype, "validate", null);
exports.ContactsController = ContactsController = __decorate([
    (0, common_1.Controller)('contacts'),
    __metadata("design:paramtypes", [parser_service_1.ParserService,
        validator_service_1.ValidatorService,
        contacts_service_1.ContactsService])
], ContactsController);
//# sourceMappingURL=contacts.controller.js.map