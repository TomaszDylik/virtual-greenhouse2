import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database';
import { JWT_SECRET } from '../config/env';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { logInfo, logError } from '../utils/logger';

const router = Router();

router.post('/register', async (req: AuthRequest, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { username, password: hashed, role: 'USER' },
    });

    logInfo(`User registered: ${username}`);
    res.status(201).json({ id: user.id, username: user.username, role: user.role });
  } catch (err: any) {
    if (err.code === 'P2002') {
      return res.status(409).json({ error: 'Username exists' });
    }
    logError(`Register error: ${err.message}`);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req: AuthRequest, res: Response) => {
  try {
    const { username, password } = req.body;

    const user = await prisma.user.findUnique({ where: { username } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    logInfo(`User logged in: ${username}`);
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  } catch (err: any) {
    logError(`Login error: ${err.message}`);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/logout', authMiddleware, (req: AuthRequest, res: Response) => {
  logInfo(`User logged out: ${req.user?.username}`);
  res.json({ message: 'Logged out' });
});

router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user?.userId },
    select: { id: true, username: true, role: true },
  });
  res.json(user);
});

export default router;