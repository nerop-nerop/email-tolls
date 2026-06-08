"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const googleapis_1 = require("googleapis");
const msal = __importStar(require("@azure/msal-node"));
const prisma_service_1 = require("../../infrastructure/prisma/prisma.service");
let OAuthController = class OAuthController {
    config;
    prisma;
    constructor(config, prisma) {
        this.config = config;
        this.prisma = prisma;
    }
    googleAuth(res) {
        const oauth2 = this.createGoogleClient();
        const url = oauth2.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/gmail.send',
                'https://www.googleapis.com/auth/gmail.readonly',
                'https://www.googleapis.com/auth/contacts.readonly',
                'https://www.googleapis.com/auth/userinfo.email',
            ],
            prompt: 'consent',
        });
        res.redirect(url);
    }
    async googleCallback(code, res) {
        const oauth2 = this.createGoogleClient();
        const { tokens } = await oauth2.getToken(code);
        oauth2.setCredentials(tokens);
        const oauth2Api = googleapis_1.google.oauth2({ version: 'v2', auth: oauth2 });
        const userInfo = await oauth2Api.userinfo.get();
        await this.prisma.mailboxToken.upsert({
            where: { provider: 'gmail' },
            create: {
                provider: 'gmail',
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt: tokens.expiry_date
                    ? new Date(tokens.expiry_date)
                    : null,
                email: userInfo.data.email ?? undefined,
            },
            update: {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token ?? undefined,
                expiresAt: tokens.expiry_date
                    ? new Date(tokens.expiry_date)
                    : null,
                email: userInfo.data.email ?? undefined,
            },
        });
        res.redirect('/?connected=gmail');
    }
    async microsoftAuth(res) {
        const client = this.createMsalClient();
        const redirectUri = this.config.get('MICROSOFT_REDIRECT_URI', 'http://localhost:3001/api/auth/microsoft/callback');
        const url = await client.getAuthCodeUrl({
            scopes: [
                'openid',
                'profile',
                'email',
                'offline_access',
                'Mail.Send',
                'Mail.Read',
                'Contacts.Read',
            ],
            redirectUri,
        });
        res.redirect(url);
    }
    async microsoftCallback(code, res) {
        const client = this.createMsalClient();
        const redirectUri = this.config.get('MICROSOFT_REDIRECT_URI', 'http://localhost:3001/api/auth/microsoft/callback');
        const result = await client.acquireTokenByCode({
            code,
            scopes: [
                'openid',
                'profile',
                'email',
                'offline_access',
                'Mail.Send',
                'Mail.Read',
                'Contacts.Read',
            ],
            redirectUri,
        });
        await this.prisma.mailboxToken.upsert({
            where: { provider: 'outlook' },
            create: {
                provider: 'outlook',
                accessToken: result.accessToken,
                expiresAt: result.expiresOn ?? null,
                email: result.account?.username,
            },
            update: {
                accessToken: result.accessToken,
                expiresAt: result.expiresOn ?? null,
                email: result.account?.username,
            },
        });
        res.redirect('/?connected=outlook');
    }
    async status() {
        const tokens = await this.prisma.mailboxToken.findMany({
            select: { provider: true, email: true, expiresAt: true },
        });
        return { connected: tokens };
    }
    createGoogleClient() {
        const redirectUri = this.config.get('GOOGLE_REDIRECT_URI', 'http://localhost:3001/api/auth/google/callback');
        return new googleapis_1.google.auth.OAuth2(this.config.get('GOOGLE_CLIENT_ID'), this.config.get('GOOGLE_CLIENT_SECRET'), redirectUri);
    }
    createMsalClient() {
        const clientId = this.config.get('MICROSOFT_CLIENT_ID');
        const clientSecret = this.config.get('MICROSOFT_CLIENT_SECRET');
        if (!clientId || !clientSecret) {
            throw new Error('Microsoft OAuth not configured');
        }
        return new msal.ConfidentialClientApplication({
            auth: {
                clientId,
                clientSecret,
                authority: 'https://login.microsoftonline.com/common',
            },
        });
    }
};
exports.OAuthController = OAuthController;
__decorate([
    (0, common_1.Get)('google'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], OAuthController.prototype, "googleAuth", null);
__decorate([
    (0, common_1.Get)('google/callback'),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "googleCallback", null);
__decorate([
    (0, common_1.Get)('microsoft'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "microsoftAuth", null);
__decorate([
    (0, common_1.Get)('microsoft/callback'),
    __param(0, (0, common_1.Query)('code')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "microsoftCallback", null);
__decorate([
    (0, common_1.Get)('status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "status", null);
exports.OAuthController = OAuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [config_1.ConfigService,
        prisma_service_1.PrismaService])
], OAuthController);
//# sourceMappingURL=oauth.controller.js.map