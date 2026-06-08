import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { promises as dns } from 'dns';
import * as net from 'net';
import validator from 'validator';

export type ValidationStatus = 'valid' | 'invalid' | 'risky';

export interface ValidationResult {
  status: ValidationStatus;
  isWorking: boolean;
  lastError?: string;
}

@Injectable()
export class EmailValidatorService {
  constructor(private readonly config: ConfigService) {}

  async validate(email: string): Promise<ValidationResult> {
    const normalized = email.trim().toLowerCase();

    if (!validator.isEmail(normalized)) {
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
      const mx = await dns.resolveMx(domain);
      if (!mx || mx.length === 0) {
        return {
          status: 'invalid',
          isWorking: false,
          lastError: 'No MX records',
        };
      }
    } catch {
      return {
        status: 'invalid',
        isWorking: false,
        lastError: 'DNS lookup failed',
      };
    }

    const smtpEnabled =
      this.config.get<string>('EMAIL_SMTP_VERIFY', 'false') === 'true';
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

  private async smtpVerify(
    email: string,
    domain: string,
  ): Promise<'valid' | 'invalid' | 'risky'> {
    try {
      const mx = await dns.resolveMx(domain);
      const host = mx.sort((a, b) => a.priority - b.priority)[0]?.exchange;
      if (!host) return 'risky';

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
              socket.write(commands[step]!);
              step++;
            } else if (step > 0 && (code === 250 || code === 220)) {
              if (step === 2) {
                clearTimeout(timeout);
                socket.destroy();
                resolve('valid');
                return;
              }
              socket.write(commands[step]!);
              step++;
            } else if (code >= 500 && step === 2) {
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
    } catch {
      return 'risky';
    }
  }
}
