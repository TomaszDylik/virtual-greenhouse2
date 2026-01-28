import http from 'http';
import app from './app';
import { initWebSocket } from './services/websocket';
import { PORT } from './config/env';
import { logInfo } from './utils/logger';

const server = http.createServer(app);

initWebSocket(server);

import('./services/simulator').then(() => {
  logInfo('MQTT Simulator started');
});

server.listen(PORT, () => {
  logInfo(`Server running on port ${PORT}`);
});