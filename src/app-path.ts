import { existsSync } from 'fs';
import { dirname, resolve } from 'path';

type PkgProcess = NodeJS.Process & { pkg?: unknown };

export function isPackaged(): boolean {
  return Boolean((process as PkgProcess).pkg);
}

export function getAppRoot(): string {
  if (process.env.POPPD_ROOT) {
    return process.env.POPPD_ROOT;
  }
  if (isPackaged()) {
    return dirname(process.execPath);
  }

  let dir = __dirname;
  for (let i = 0; i < 8; i++) {
    if (
      existsSync(resolve(dir, 'package.json')) &&
      existsSync(resolve(dir, 'apps/mobile')) &&
      existsSync(resolve(dir, 'packages/database'))
    ) {
      return dir;
    }
    dir = resolve(dir, '..');
  }
  return process.cwd();
}
