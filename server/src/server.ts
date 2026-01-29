import http from 'http';
import app from './app';
import { initWebSocket } from './services/websocket';
import { PORT } from './config/env';
import { logger } from './utils/logger';

const server = http.createServer(app);

initWebSocket(server);

import('./services/simulator').then(() => {
  logger.info('MQTT Simulator started');
});

server.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});