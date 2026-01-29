import { Router } from 'express';
import prisma from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// GET all plants for current user
router.get('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const plants = await prisma.plant.findMany({
      where: { 
        userId: req.user!.id,
        isDead: false 
      },
      include: { species: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(plants);
  } catch (error) {
    logger.error('Failed to fetch plants');
    res.status(500).json({ error: 'Failed to fetch plants' });
  }
});

// GET dead plants for current user
router.get('/dead', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const plants = await prisma.plant.findMany({
      where: { 
        userId: req.user!.id,
        isDead: true 
      },
      include: { species: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(plants);
  } catch (error) {
    logger.error('Failed to fetch dead plants');
    res.status(500).json({ error: 'Failed to fetch dead plants' });
  }
});

// GET single plant
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const plant = await prisma.plant.findFirst({
      where: { 
        id: parseInt(req.params.id),
        userId: req.user!.id 
      },
      include: { species: true, logs: true },
    });
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }
    res.json(plant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch plant' });
  }
});

// CREATE plant for current user
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { name, speciesId } = req.body;
    
    if (!name || !speciesId) {
      return res.status(400).json({ error: 'Name and speciesId are required' });
    }
    
    const plant = await prisma.plant.create({
      data: {
        name,
        speciesId: parseInt(speciesId),
        userId: req.user!.id,
        currentWater: 100,
      },
      include: { species: true },
    });
    
    await prisma.log.create({
      data: {
        message: `Plant "${name}" created`,
        level: 'INFO',
        plantId: plant.id,
      },
    });
    
    logger.info(`Plant created: ${name}`);
    res.status(201).json(plant);
  } catch (error) {
    logger.error(`Failed to create plant: ${error}`);
    res.status(500).json({ error: 'Failed to create plant' });
  }
});

// UPDATE plant
router.put('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const existing = await prisma.plant.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user!.id },
    });
    
    if (!existing) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    const { name, currentWater } = req.body;
    const plant = await prisma.plant.update({
      where: { id: parseInt(req.params.id) },
      data: { name, currentWater: parseFloat(currentWater) },
      include: { species: true },
    });
    res.json(plant);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update plant' });
  }
});

// DELETE plant
router.delete('/:id', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const plant = await prisma.plant.findFirst({
      where: { id: parseInt(req.params.id), userId: req.user!.id },
      include: { species: true },
    });
    
    if (!plant) {
      return res.status(404).json({ error: 'Plant not found' });
    }

    // Create deletion log before deleting
    await prisma.log.create({
      data: {
        message: `Plant "${plant.name}" (${plant.species.name}) was deleted by user`,
        level: 'WARNING',
      },
    });

    await prisma.plant.delete({
      where: { id: parseInt(req.params.id) },
    });
    
    logger.info(`Plant deleted: ${plant.name}`);
    res.json({ message: 'Plant deleted', deletedPlant: plant.name });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete plant' });
  }
});

// SEARCH plants for current user
router.get('/search/:pattern', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const plants = await prisma.plant.findMany({
      where: {
        userId: req.user!.id,
        name: { contains: req.params.pattern, mode: 'insensitive' },
      },
      include: { species: true },
    });
    res.json(plants);
  } catch (error) {
    res.status(500).json({ error: 'Search failed' });
  }
});

export default router;