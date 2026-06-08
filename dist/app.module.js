"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./infrastructure/prisma/prisma.module");
const queue_module_1 = require("./infrastructure/queue/queue.module");
const contacts_module_1 = require("./modules/contacts/contacts.module");
const parser_module_1 = require("./modules/parser/parser.module");
const validator_module_1 = require("./modules/validator/validator.module");
const export_module_1 = require("./modules/export/export.module");
const campaign_module_1 = require("./modules/campaign/campaign.module");
const ai_module_1 = require("./modules/ai/ai.module");
const mailbox_module_1 = require("./modules/mailbox/mailbox.module");
const oauth_module_1 = require("./modules/oauth/oauth.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            queue_module_1.QueueModule,
            parser_module_1.ParserModule,
            validator_module_1.ValidatorModule,
            contacts_module_1.ContactsModule,
            export_module_1.ExportModule,
            campaign_module_1.CampaignModule,
            ai_module_1.AiModule,
            mailbox_module_1.MailboxModule,
            oauth_module_1.OAuthModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map