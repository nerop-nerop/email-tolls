# Email Tool

Парсер почты + Excel + рассылка на базе NestJS.

## Быстрый старт

Браузер: http://localhost:3001

### Настройка

1. Скопируйте `.env.example` в `.env`:
   ```bash
   cp .env.example .env
   ```

2. Заполните необходимые переменные окружения:
   - **SMTP** — для отправки писем через SMTP
   - **OAuth** (Google/Microsoft) — для OAuth-аутентификации
   - **OpenAI** — для AI-генерации контента писем

### Основные переменные окружения

```bash
# Порт приложения
EMAIL_TOOL_PORT=3001

# SMTP (для отправки писем)
SMTP_HOST=smtp.mail.ru
SMTP_PORT=465
SMTP_USER=your-email@mail.ru
SMTP_PASS=your-password

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3001/api/auth/google/callback

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret
MICROSOFT_REDIRECT_URI=http://localhost:3001/api/auth/microsoft/callback

# OpenAI (для генерации писем)
OPENAI_API_KEY=your-api-key
OPENAI_MODEL=gpt-4o-mini
```

## Установка зависимостей

```bash
npm install
```

## Запуск

### Режим разработки (с авто-перезагрузкой)

```bash
npm run dev
```

### Сборка и запуск в production

```bash
npm run build
npm start
```

## Доступные скрипты

| Команда | Описание |
|---------|----------|
| `npm run dev` | Запуск в режиме разработки с watch |
| `npm run build` | Сборка проекта |
| `npm start` | Запуск собранного приложения |
| `npm run lint` | Проверка типов TypeScript |

## Остановка

Закройте окно консоли или нажмите `Ctrl+C`.

## Технологии

- **NestJS** — backend фреймворк
- **TypeScript** — язык разработки
- **BullMQ** — очередь задач
- **ExcelJS** — работа с Excel файлами
- **Nodemailer** — отправка email
- **Cheerio** — парсинг HTML
- **OpenAI** — AI-генерация контента

## Лицензия

MIT
