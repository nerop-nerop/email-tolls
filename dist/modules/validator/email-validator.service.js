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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailValidatorService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const dns_1 = require("dns");
const net = __importStar(require("net"));
const validator_1 = __importDefault(require("validator"));
let EmailValidatorService = class EmailValidatorService {
    config;
    constructor(config) {
        this.config = config;
    }
    async validate(email) {
        const normalized = email.trim().toLowerCase();
        if (!validator_1.default.isEmail(normalized)) {
            return {
                status: 'invalid',
                isWorking: false,
                lastError: 'Invalid email syntax',
            };
        }
        const domain = normalized.split('@')[1];
        if (!domain) {
            return {
                status: 'invalid',
                isWorking: false,
                lastError: 'Missing domain',
            };
        }
        try {
            const mx = await dns_1.promises.resolveMx(domain);
            if (!mx || mx.length === 0) {
                return {
                    status: 'invalid',
                    isWorking: false,
                    lastError: 'No MX records',
                };
            }
        }
        catch {
            return {
                status: 'invalid',
                isWorking: false,
                lastError: 'DNS lookup failed',
            };
        }
        const smtpEnabled = this.config.get('EMAIL_SMTP_VERIFY', 'false') === 'true';
        if (!smtpEnabled) {
            return { status: 'valid', isWorking: true };
        }
        const smtpResult = await this.smtpVerify(normalized, domain);
        if (smtpResult === 'valid') {
            return { status: 'valid', isWorking: true };
        }
        if (smtpResult === 'invalid') {
            return {
                status: 'invalid',
                isWorking: false,
                lastError: 'SMTP rejected recipient',
            };
        }
        return {
            status: 'risky',
            isWorking: true,
            lastError: 'SMTP check inconclusive',
        };
    }
    async smtpVerify(email, domain) {
        try {
            const mx = await dns_1.promises.resolveMx(domain);
            const host = mx.sort((a, b) => a.priority - b.priority)[0]?.exchange;
            if (!host)
                return 'risky';
            return await new Promise((resolve) => {
                const socket = net.createConnection(25, host);
                let step = 0;
                const commands = [`EHLO messenger.local\r\n`, `MAIL FROM:<verify@messenger.local>\r\n`, `RCPT TO:<${email}>\r\n`, `QUIT\r\n`];
                const timeout = setTimeout(() => {
                    socket.destroy();
                    resolve('risky');
                }, 8_000);
                socket.on('data', (data) => {
                    const code = parseInt(data.toString().slice(0, 3), 10);
                    if (step < commands.length) {
                        if (step === 0 && code === 220) {
                            socket.write(commands[step]);
                            step++;
                        }
                        else if (step > 0 && (code === 250 || code === 220)) {
                            if (step === 2) {
                                clearTimeout(timeout);
                                socket.destroy();
                                resolve('valid');
                                return;
                            }
                            socket.write(commands[step]);
                            step++;
                        }
                        else if (code >= 500 && step === 2) {
                            clearTimeout(timeout);
                            socket.destroy();
                            resolve('invalid');
                        }
                    }
                });
                socket.on('error', () => {
                    clearTimeout(timeout);
                    resolve('risky');
                });
            });
        }
        catch {
            return 'risky';
        }
    }
};
exports.EmailValidatorService = EmailValidatorService;
exports.EmailValidatorService = EmailValidatorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], EmailValidatorService);
//# sourceMappingURL=email-validator.service.js.map