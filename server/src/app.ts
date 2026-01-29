import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import usersRoutes from './routes/users.routes';
import speciesRoutes from './routes/species.routes';
import plantsRoutes from './routes/plants.routes';
import logsRoutes from './routes/logs.routes';
import sseRoutes from './routes/sse.routes';

const app = express();

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:5174'], credentials: true }));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Virtual Greenhouse API', version: '1.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/species', speciesRoutes);
app.use('/api/plants', plantsRoutes);
app.use('/api/logs', logsRoutes);
app.use('/api/sse', sseRoutes);

export default app;