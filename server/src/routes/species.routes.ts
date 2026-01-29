import { Router } from 'express';
import prisma from '../config/database';
import { authMiddleware } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// GET all species
router.get('/', authMiddleware, async (req, res) => {
  try {
    const species = await prisma.species.findMany({
      orderBy: { name: 'asc' },
    });
    res.json(species);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch species' });
  }
});

// GET single species
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const species = await prisma.species.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { plants: true },
    });
    if (!species) {
      return res.status(404).json({ error: 'Species not found' });
    }
    res.json(species);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch species' });
  }
});

// CREATE species
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, dryingRate } = req.body;
    const species = await prisma.species.create({
      data: { name, dryingRate: parseFloat(dryingRate) },
    });
    logger.info(`Species created: ${name}`);
    res.status(201).json(species);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create species' });
  }
});

// UPDATE species (edit drying rate, name, etc.)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, dryingRate } = req.body;
    const species = await prisma.species.update({
      where: { id: parseInt(req.params.id) },
      data: { 
        name: name || undefined, 
        dryingRate: dryingRate ? parseFloat(dryingRate) : undefined 
      },
    });
    logger.info(`Species updated: ${species.name}`);
    res.json(species);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update species' });
  }
});

// DELETE species
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await prisma.species.delete({
      where: { id: parseInt(req.params.id) },
    });
    logger.info('Species deleted');
    res.json({ message: 'Species deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete species' });
  }
});

// SEARCH species
router.get('/search/:pattern', authMiddleware, async (req, res) => {
  try {
    const species = await prisma.species.findMany({
      where: {
        name: { contains: req.params.pattern, mode: 'insensitive' },
      },
    });
    res.json(species);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;