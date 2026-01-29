import { Router, Response } from 'express';
import prisma from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { search, level } = req.query;

  const logs = await prisma.log.findMany({
    where: {
      ...(search && { message: { contains: String(search), mode: 'insensitive' } }),
      ...(level && { level: String(level) }),
    },
    include: { plant: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'desc' },
  });

  res.json(logs);
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const log = await prisma.log.findUnique({
    where: { id: Number(req.params.id) },
    include: { plant: { select: { id: true, name: true } } },
  });

  if (!log) return res.status(404).json({ error: 'Log not found' });
  res.json(log);
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { message, level, plantId } = req.body;

  if (!message) return res.status(400).json({ error: 'Message required' });

  const log = await prisma.log.create({
    data: { message, level: level || 'INFO', plantId: plantId || null },
  });

  logger.info(`Log created: ${message}`);
  res.status(201).json(log);
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  await prisma.log.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: 'Log deleted' });
});

export default router;