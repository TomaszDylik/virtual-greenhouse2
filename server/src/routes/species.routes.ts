import { Router, Response } from 'express';
import prisma from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { logInfo } from '../utils/logger';

const router = Router();

router.get('/', async (req: AuthRequest, res: Response) => {
  const { search } = req.query;

  const species = await prisma.species.findMany({
    where: search ? { name: { contains: String(search), mode: 'insensitive' } } : {},
  });

  res.json(species);
});

router.get('/:id', async (req: AuthRequest, res: Response) => {
  const species = await prisma.species.findUnique({
    where: { id: Number(req.params.id) },
  });

  if (!species) return res.status(404).json({ error: 'Species not found' });
  res.json(species);
});

router.post('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name, dryingRate } = req.body;

  if (!name || typeof dryingRate !== 'number') {
    return res.status(400).json({ error: 'Name and dryingRate required' });
  }

  const species = await prisma.species.create({ data: { name, dryingRate } });
  logInfo(`Species created: ${name}`);
  res.status(201).json(species);
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { name, dryingRate } = req.body;

  const species = await prisma.species.update({
    where: { id: Number(req.params.id) },
    data: { ...(name && { name }), ...(dryingRate && { dryingRate }) },
  });

  logInfo(`Species updated: ${species.name}`);
  res.json(species);
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  await prisma.species.delete({ where: { id: Number(req.params.id) } });
  logInfo(`Species deleted: ${req.params.id}`);
  res.json({ message: 'Species deleted' });
});

export default router;