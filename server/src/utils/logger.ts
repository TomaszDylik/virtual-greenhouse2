import fs from 'fs';
import path from 'path';

const LOGS_DIR = path.join(__dirname, '../../logs');
const LOG_FILE = path.join(LOGS_DIR, 'app.log');

if (!fs.existsSync(LOGS_DIR)) {
  fs.mkdirSync(LOGS_DIR, { recursive: true });
}

function write(msg: string) {
  fs.appendFileSync(LOG_FILE, msg + '\n');
}

export function logInfo(msg: string) {
  const line = `[${new Date().toISOString()}] [INFO] ${msg}`;
  console.log(line);
  write(line);
}

export function logError(msg: string) {
  const line = `[${new Date().toISOString()}] [ERROR] ${msg}`;
  console.error(line);
  write(line);
}