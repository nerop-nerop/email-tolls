import { ConfigService } from '@nestjs/config';
export type ValidationStatus = 'valid' | 'invalid' | 'risky';
export interface ValidationResult {
    status: ValidationStatus;
    isWorking: boolean;
    lastError?: string;
}
export declare class EmailValidatorService {
    private readonly config;
    constructor(config: ConfigService);
    validate(email: string): Promise<ValidationResult>;
    private smtpVerify;
}
//# sourceMappingURL=email-validator.service.d.ts.map