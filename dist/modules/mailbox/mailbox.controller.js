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
exports.MailboxController = void 0;
const common_1 = require("@nestjs/common");
const parser_service_1 = require("../parser/parser.service");
const mailbox_parser_1 = require("./mailbox.parser");
const import_mailbox_dto_1 = require("./dto/import-mailbox.dto");
let MailboxController = class MailboxController {
    mailboxParser;
    parser;
    constructor(mailboxParser, parser) {
        this.mailboxParser = mailboxParser;
        this.parser = parser;
    }
    async importMailbox(dto) {
        const parsed = await this.mailboxParser.importFromProvider(dto.provider, dto.skipSupport ?? true);
        return this.parser.saveContacts(parsed, dto.provider);
    }
};
exports.MailboxController = MailboxController;
__decorate([
    (0, common_1.Post)('mailbox'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [import_mailbox_dto_1.ImportMailboxDto]),
    __metadata("design:returntype", Promise)
], MailboxController.prototype, "importMailbox", null);
exports.MailboxController = MailboxController = __decorate([
    (0, common_1.Controller)('contacts/import'),
    __metadata("design:paramtypes", [mailbox_parser_1.MailboxParser,
        parser_service_1.ParserService])
], MailboxController);
//# sourceMappingURL=mailbox.controller.js.map