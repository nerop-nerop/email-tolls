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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const openai_1 = __importDefault(require("openai"));
let AiService = class AiService {
    config;
    openai = null;
    constructor(config) {
        this.config = config;
        const apiKey = config.get('OPENAI_API_KEY');
        const baseURL = config.get('OPENAI_BASE_URL');
        if (apiKey) {
            this.openai = new openai_1.default({ apiKey, baseURL });
        }
    }
    async generateEmail(productDescription, tone = 'деловой', language = 'русский') {
        if (!this.openai) {
            return this.fallbackGenerate(productDescription, tone);
        }
        const response = await this.openai.chat.completions.create({
            model: this.config.get('OPENAI_MODEL', 'gpt-4o-mini'),
            messages: [
                {
                    role: 'system',
                    content: `Ты копирайтер email-рассылок. Пиши на ${language} языке. Верни JSON: {"subject":"...","bodyHtml":"..."}. bodyHtml — HTML с 2 абзацами. Тон: ${tone}.`,
                },
                {
                    role: 'user',
                    content: `Напиши рекламное письмо: ${productDescription}`,
                },
            ],
            response_format: { type: 'json_object' },
        });
        const content = response.choices[0]?.message?.content;
        if (!content) {
            return this.fallbackGenerate(productDescription, tone);
        }
        const parsed = JSON.parse(content);
        return {
            subject: parsed.subject,
            bodyHtml: parsed.bodyHtml,
        };
    }
    fallbackGenerate(productDescription, tone) {
        return {
            subject: `Специальное предложение: ${productDescription.slice(0, 50)}`,
            bodyHtml: `<p>Здравствуйте{{name}}!</p><p>Представляем вам ${productDescription}. Тон письма: ${tone}.</p><p>С уважением,<br>Команда</p>`,
        };
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map