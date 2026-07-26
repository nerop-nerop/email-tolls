import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import * as cheerio from 'cheerio';
import axios from 'axios';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Хранилище аккаунтов в памяти (в продакшене используйте БД)
const emailAccounts: Map<string, any> = new Map();

// Создание почтового транспортера
function createTransporter(account: any) {
  return nodemailer.createTransport({
    host: account.smtpHost,
    port: account.smtpPort,
    secure: account.smtpPort === 465,
    auth: {
      user: account.email,
      pass: account.password,
    },
  });
}

// API: Добавить почтовый аккаунт
app.post('/api/accounts', (req, res) => {
  const { email, smtpHost, smtpPort, imapHost, imapPort, password } = req.body;
  const id = Date.now().toString();
  
  const account = {
    id,
    email,
    smtpHost,
    smtpPort,
    imapHost,
    imapPort,
    password,
  };
  
  emailAccounts.set(id, account);
  res.json(account);
});

// API: Получить все аккаунты
app.get('/api/accounts', (req, res) => {
  const accounts = Array.from(emailAccounts.values());
  res.json(accounts);
});

// API: Удалить аккаунт
app.delete('/api/accounts/:id', (req, res) => {
  emailAccounts.delete(req.params.id);
  res.json({ success: true });
});

// API: Парсинг веб-страницы
app.post('/api/parse', async (req, res) => {
  const { url } = req.body;
  
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 10000,
    });
    
    const $ = cheerio.load(response.data);
    const parsedData: any[] = [];
    
    // Улучшенный парсер: ищет заголовки, описания, ссылки
    $('h1, h2, h3, h4, h5, h6').each((i, elem) => {
      const title = $(elem).text().trim();
      if (title.length > 5 && title.length < 200) {
        let description = '';
        let nextElem = $(elem).next();
        
        // Ищем описание после заголовка
        for (let j = 0; j < 3 && nextElem.length; j++) {
          if (nextElem.is('p')) {
            description = nextElem.text().trim();
            break;
          }
          nextElem = nextElem.next();
        }
        
        // Пытаемся найти ссылку
        let linkUrl = url;
        const parentLink = $(elem).closest('a');
        if (parentLink.length && parentLink.attr('href')) {
          linkUrl = new URL(parentLink.attr('href')!, url).href;
        }
        
        parsedData.push({
          id: `${Date.now()}-${i}`,
          title,
          description: description.substring(0, 300),
          url: linkUrl,
          source: new URL(url).hostname,
          timestamp: new Date(),
        });
      }
    });
    
    // Если не нашли заголовки, пробуем спарсить meta теги
    if (parsedData.length === 0) {
      const title = $('title').text().trim() || $('meta[property="og:title"]').attr('content') || '';
      const description = $('meta[name="description"]').attr('content') || 
                         $('meta[property="og:description"]').attr('content') || '';
      
      if (title) {
        parsedData.push({
          id: `${Date.now()}-meta`,
          title,
          description: description.substring(0, 300),
          url,
          source: new URL(url).hostname,
          timestamp: new Date(),
        });
      }
    }
    
    // Ограничиваем количество результатов
    const limitedData = parsedData.slice(0, 50);
    
    res.json({ success: true, data: limitedData });
  } catch (error: any) {
    res.json({ 
      success: false, 
      error: error.message || 'Ошибка при парсинге' 
    });
  }
});

// API: Отправить одно письмо
app.post('/api/send', async (req, res) => {
  const { accountId, to, subject, body } = req.body;
  
  const account = emailAccounts.get(accountId);
  if (!account) {
    return res.status(404).json({ error: 'Аккаунт не найден' });
  }
  
  try {
    const transporter = createTransporter(account);
    
    await transporter.sendMail({
      from: account.email,
      to,
      subject,
      text: body,
      html: body.replace(/\n/g, '<br>'),
    });
    
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Ошибка отправки' });
  }
});

// API: Массовая рассылка
app.post('/api/send-bulk', async (req, res) => {
  const { accountId, recipients, subject, body } = req.body;
  
  const account = emailAccounts.get(accountId);
  if (!account) {
    return res.status(404).json({ error: 'Аккаунт не найден' });
  }
  
  try {
    const transporter = createTransporter(account);
    const results = { sent: 0, failed: 0 };
    
    for (const recipient of recipients) {
      try {
        await transporter.sendMail({
          from: account.email,
          to: recipient,
          subject,
          text: body,
          html: body.replace(/\n/g, '<br>'),
        });
        results.sent++;
        
        // Небольшая задержка между письмами
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        results.failed++;
        console.error(`Failed to send to ${recipient}:`, error);
      }
    }
    
    res.json({ success: true, results });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Ошибка рассылки' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
