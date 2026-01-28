import { Router, Response } from 'express';
import prisma from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { logInfo } from '../utils/logger';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  const { search, isDead } = req.query;

  const plants = await prisma.plant.findMany({
    where: {
      ...(search && { name: { contains: String(search), mode: 'insensitive' } }),
      ...(isDead !== undefined && { isDead: isDead === 'true' }),
    },
    include: { species: true, user: { select: { id: true, username: true } } },
  });

  res.json(plants);
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const plant = await prisma.plant.findUnique({
    where: { id: Number(req.params.id) },
    include: { species: true, user: { select: { id: true, username: true } } },
  });

  if (!plant) return res.status(404).json({ error: 'Plant not found' });
  res.json(plant);
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name, speciesId } = req.body;

  if (!name || !speciesId) {
    return res.status(400).json({ error: 'Name and speciesId required' });
  }

  const plant = await prisma.plant.create({
    data: { name, speciesId, userId: req.user?.userId, currentWater: 100 },
    include: { species: true },
  });

  logInfo(`Plant created: ${name}`);
  res.status(201).json(plant);
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name, currentWater, isDead } = req.body;

  const plant = await prisma.plant.update({
    where: { id: Number(req.params.id) },
    data: {
      ...(name && { name }),
      ...(currentWater !== undefined && { currentWater }),
      ...(isDead !== undefined && { isDead }),
    },
    include: { species: true },
  });

  logInfo(`Plant updated: ${plant.name}`);
  res.json(plant);
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  await prisma.plant.delete({ where: { id: Number(req.params.id) } });
  logInfo(`Plant deleted: ${req.params.id}`);
  res.json({ message: 'Plant deleted' });
});

router.post('/:id/water', authMiddleware, async (req: AuthRequest, res: Response) => {
  const plant = await prisma.plant.findUnique({ where: { id: Number(req.params.id) } });

  if (!plant) return res.status(404).json({ error: 'Plant not found' });
  if (plant.isDead) return res.status(400).json({ error: 'Plant is dead' });

  const updated = await prisma.plant.update({
    where: { id: plant.id },
    data: { currentWater: 100 },
    include: { species: true },
  });

  await prisma.log.create({
    data: { message: `Plant "${plant.name}" watered`, level: 'INFO', plantId: plant.id },
  });

  logInfo(`Plant watered: ${plant.name}`);
  res.json(updated);
});

export default router;