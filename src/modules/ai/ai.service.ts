import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export interface GeneratedEmail {
  subject: string;
  bodyHtml: string;
}

@Injectable()
export class AiService {
  private openai: OpenAI | null = null;

  constructor(private readonly config: ConfigService) {
    const apiKey = config.get<string>('OPENAI_API_KEY');
    const baseURL = config.get<string>('OPENAI_BASE_URL');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey, baseURL });
    }
  }

  async generateEmail(
    productDescription: string,
    tone = 'деловой',
    language = 'русский',
  ): Promise<GeneratedEmail> {
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

    const parsed = JSON.parse(content) as GeneratedEmail;
    return {
      subject: parsed.subject,
      bodyHtml: parsed.bodyHtml,
    };
  }

  private fallbackGenerate(
    productDescription: string,
    tone: string,
  ): GeneratedEmail {
    return {
      subject: `Специальное предложение: ${productDescription.slice(0, 50)}`,
      bodyHtml: `<p>Здравствуйте{{name}}!</p><p>Представляем вам ${productDescription}. Тон письма: ${tone}.</p><p>С уважением,<br>Команда</p>`,
    };
  }
}
