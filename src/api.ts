import { EmailAccount, ParsedData, ParseResult } from './types';

const API_BASE_URL = 'http://localhost:3001/api';

export const api = {
  async addEmailAccount(account: Omit<EmailAccount, 'id'>): Promise<EmailAccount> {
    const response = await fetch(`${API_BASE_URL}/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(account),
    });
    if (!response.ok) throw new Error('Failed to add email account');
    return response.json();
  },

  async getEmailAccounts(): Promise<EmailAccount[]> {
    const response = await fetch(`${API_BASE_URL}/accounts`);
    if (!response.ok) throw new Error('Failed to get email accounts');
    return response.json();
  },

  async deleteEmailAccount(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/accounts/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete email account');
  },

  async parseWebsite(url: string): Promise<ParseResult> {
    const response = await fetch(`${API_BASE_URL}/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (!response.ok) throw new Error('Failed to parse website');
    return response.json();
  },

  async sendEmail(accountId: string, to: string, subject: string, body: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, to, subject, body }),
    });
    if (!response.ok) throw new Error('Failed to send email');
  },

  async sendBulkEmails(accountId: string, recipients: string[], subject: string, body: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/send-bulk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId, recipients, subject, body }),
    });
    if (!response.ok) throw new Error('Failed to send bulk emails');
  },
};
