import { config } from 'dotenv';
import { existsSync, mkdirSync } from 'fs';
import { join, resolve } from 'path';
import { getAppRoot, isPackaged } from './app-path';

export function loadEnv(): void {
  const root = getAppRoot();
  const envPath = resolve(root, '.env');
  const envExamplePath = resolve(root, '.env.example');

  if (existsSync(envPath)) {
    config({ path: envPath });
  } else if (existsSync(envExamplePath)) {
    config({ path: envExamplePath });
  }

  const useSqlite =
    !process.env.DATABASE_URL ||
    process.env.DATABASE_URL.startsWith('file:');

  if (useSqlite) {
    const dataDir = join(root, 'data');
    if (!existsSync(dataDir)) {
      mkdirSync(dataDir, { recursive: true });
    }
    const dbFile = join(dataDir, 'app.db');
    process.env.DATABASE_URL = `file:${dbFile}`;
  }

  if (isPackaged()) {
    const enginePath = join(root, 'prisma', 'query_engine-windows.dll.node');
    if (existsSync(enginePath)) {
      process.env.PRISMA_QUERY_ENGINE_LIBRARY = enginePath;
    }
    process.env.REDIS_ENABLED ??= 'false';
    process.env.EMAIL_TOOL_PORT ??= '3001';
  }
}
