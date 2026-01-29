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

function info(msg: string) {
  const line = `[${new Date().toISOString()}] [INFO] ${msg}`;
  console.log(line);
  write(line);
}

function error(msg: string) {
  const line = `[${new Date().toISOString()}] [ERROR] ${msg}`;
  console.error(line);
  write(line);
}

export const logger = {
  info,
  error,
};