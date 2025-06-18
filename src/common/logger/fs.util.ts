import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export function ensureLogsDirExists(): void {
  const logsPath = join(__dirname, '..', '..', 'logs');
  if (!existsSync(logsPath)) {
    mkdirSync(logsPath);
  }
}
