export interface EmailAccount {
  id: string;
  email: string;
  smtpHost: string;
  smtpPort: number;
  imapHost: string;
  imapPort: number;
  password: string;
}

export interface ParsedData {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  timestamp: Date;
}

export interface EmailMessage {
  to: string;
  subject: string;
  body: string;
  html?: boolean;
}

export interface ParseResult {
  success: boolean;
  data: ParsedData[];
  error?: string;
}
