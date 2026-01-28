import bcrypt from 'bcryptjs';
import prisma from './config/database';

async function seed() {
  console.log('Seeding database...');

  const adminPass = await bcrypt.hash('admin123', 10);
  const userPass = await bcrypt.hash('user123', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: { username: 'admin', password: adminPass, role: 'ADMIN' },
  });

  await prisma.user.upsert({
    where: { username: 'user' },
    update: {},
    create: { username: 'user', password: userPass, role: 'USER' },
  });

  const tomato = await prisma.species.upsert({
    where: { name: 'Tomato' },
    update: {},
    create: { name: 'Tomato', dryingRate: 2.0 },
  });

  const cactus = await prisma.species.upsert({
    where: { name: 'Cactus' },
    update: {},
    create: { name: 'Cactus', dryingRate: 0.5 },
  });

  await prisma.plant.createMany({
    skipDuplicates: true,
    data: [
      { name: 'My Tomato', speciesId: tomato.id, currentWater: 100 },
      { name: 'Office Cactus', speciesId: cactus.id, currentWater: 80 },
    ],
  });

  console.log('Seed completed!');
}

seed()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());