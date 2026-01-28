import 'dotenv/config';

export const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
export const PORT = process.env.PORT || 4000;
export const MQTT_URL = process.env.MQTT_BROKER_URL || 'mqtt://localhost:1883';