import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { exec } from 'child_process';
import helmet from 'helmet';
import { existsSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';
import { getAppRoot, isPackaged } from './app-path';
import { loadEnv } from './load-env';

loadEnv();

function resolvePublicDir(): string {
  const external = join(getAppRoot(), 'public');
  if (existsSync(external)) {
    return external;
  }
  return join(__dirname, 'public');
}

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(helmet({ contentSecurityPolicy: false }));
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.setGlobalPrefix('api');
  app.useStaticAssets(resolvePublicDir());

  const port = Number(process.env.EMAIL_TOOL_PORT ?? 3001);
  await app.listen(port, '0.0.0.0');
  const url = `http://localhost:${port}`;
  console.log(`Poppd Email Tool: ${url}`);
  if (isPackaged()) {
    exec(`start ${url}`);
  }
}

void bootstrap();
