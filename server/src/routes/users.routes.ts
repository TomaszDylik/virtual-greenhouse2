import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { search } = req.query;

  const users = await prisma.user.findMany({
    where: search ? { username: { contains: String(search), mode: 'insensitive' } } : {},
    select: { id: true, username: true },
  });

  res.json(users);
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(req.params.id) },
    select: { id: true, username: true },
  });

  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const { username, password } = req.body;

  if (req.user?.id !== id) {
    return res.status(403).json({ error: 'Access denied' });
  }

  const data: any = {};
  if (username) data.username = username;
  if (password) data.password = await bcrypt.hash(password, 10);

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, username: true },
  });

  logger.info(`User updated: ${user.username}`);
  res.json(user);
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  
  if (req.user?.id !== id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  await prisma.user.delete({ where: { id } });
  logger.info(`User deleted: ${id}`);
  res.json({ message: 'User deleted' });
});

export default router;