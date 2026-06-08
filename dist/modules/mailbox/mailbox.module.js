"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MailboxModule = void 0;
const common_1 = require("@nestjs/common");
const parser_module_1 = require("../parser/parser.module");
const mailbox_controller_1 = require("./mailbox.controller");
const mailbox_parser_1 = require("./mailbox.parser");
let MailboxModule = class MailboxModule {
};
exports.MailboxModule = MailboxModule;
exports.MailboxModule = MailboxModule = __decorate([
    (0, common_1.Module)({
        imports: [parser_module_1.ParserModule],
        controllers: [mailbox_controller_1.MailboxController],
        providers: [mailbox_parser_1.MailboxParser],
        exports: [mailbox_parser_1.MailboxParser],
    })
], MailboxModule);
//# sourceMappingURL=mailbox.module.js.map