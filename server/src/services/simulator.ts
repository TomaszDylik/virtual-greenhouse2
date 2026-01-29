import mqtt from 'mqtt';
import prisma from '../config/database';
import { MQTT_URL } from '../config/env';
import { logger } from '../utils/logger';

const client = mqtt.connect(MQTT_URL);

client.on('connect', () => {
  logger.info('MQTT Simulator connected');

  setInterval(async () => {
    try {
      const plants = await prisma.plant.findMany({
        where: { isDead: false },
        include: { species: true },
      });

      for (const plant of plants) {
        if (!plant.species) continue;

        const newWater = Math.max(0, plant.currentWater - plant.species.dryingRate);

        await prisma.plant.update({
          where: { id: plant.id },
          data: { currentWater: newWater },
        });

        client.publish(`greenhouse/sensors/${plant.id}`, JSON.stringify({
          plantId: plant.id,
          name: plant.name,
          currentWater: newWater,
          timestamp: new Date().toISOString(),
        }));
      }
    } catch (err: any) {
      logger.error(`Simulator error: ${err.message}`);
    }
  }, 2000);
});

client.on('error', (err) => {
  logger.error(`MQTT error: ${err.message}`);
});

export { client as mqttClient };