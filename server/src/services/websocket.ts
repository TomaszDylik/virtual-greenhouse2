import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import mqtt from 'mqtt';
import prisma from '../config/database';
import { MQTT_URL } from '../config/env';
import { logInfo, logError } from '../utils/logger';
import { sendSSE } from '../routes/sse.routes';

let io: Server;

export function initWebSocket(server: HttpServer) {
  io = new Server(server, {
    cors: { origin: ['http://localhost:5173'], credentials: true },
  });

  const mqttClient = mqtt.connect(MQTT_URL);

  mqttClient.on('connect', () => {
    logInfo('WebSocket bridge connected to MQTT');
    mqttClient.subscribe('greenhouse/sensors/#');
  });

  mqttClient.on('message', async (topic, msg) => {
    try {
      const data = JSON.parse(msg.toString());
      const { plantId, currentWater } = data;

      const plant = await prisma.plant.findUnique({ where: { id: plantId } });
      if (!plant) return;

      if (currentWater <= 0 && !plant.isDead) {
        await prisma.plant.update({ where: { id: plantId }, data: { isDead: true } });

        await prisma.log.create({
          data: { message: `Plant "${plant.name}" died`, level: 'CRITICAL', plantId },
        });

        io.emit('plant-died', { plantId, name: plant.name });
        sendSSE('plant-died', { plantId, name: plant.name });
        logInfo(`Plant died: ${plant.name}`);
      }

      const update = { plantId, waterLevel: currentWater, isDead: currentWater <= 0, name: plant.name };
      io.emit('plant-update', update);
      sendSSE('plant-update', update);
    } catch (err: any) {
      logError(`WS message error: ${err.message}`);
    }
  });

  io.on('connection', (socket) => {
    logInfo(`WS client connected: ${socket.id}`);

    socket.on('water-plant', async ({ plantId }) => {
      const plant = await prisma.plant.findUnique({ where: { id: plantId } });
      if (plant && !plant.isDead) {
        await prisma.plant.update({ where: { id: plantId }, data: { currentWater: 100 } });
        io.emit('plant-watered', { plantId, waterLevel: 100 });
        logInfo(`Plant watered via WS: ${plant.name}`);
      }
    });

    socket.on('disconnect', () => logInfo(`WS client disconnected: ${socket.id}`));
  });

  return io;
}

export { io };