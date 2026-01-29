import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear existing data
  await prisma.log.deleteMany();
  await prisma.plant.deleteMany();
  await prisma.species.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const user1 = await prisma.user.create({
    data: {
      username: 'user1',
      password: await bcrypt.hash('user123', 10),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      username: 'user2',
      password: await bcrypt.hash('user123', 10),
    },
  });

  const user3 = await prisma.user.create({
    data: {
      username: 'user3',
      password: await bcrypt.hash('user123', 10),
    },
  });

  // Create species
  const tomato = await prisma.species.create({
    data: { name: 'Pomidor', dryingRate: 5.0 },
  });

  const cactus = await prisma.species.create({
    data: { name: 'Kaktus', dryingRate: 1.0 },
  });

  const fern = await prisma.species.create({
    data: { name: 'Paproć', dryingRate: 8.0 },
  });

  const rose = await prisma.species.create({
    data: { name: 'Róża', dryingRate: 6.0 },
  });

  // Create plants for user1
  await prisma.plant.createMany({
    data: [
      { name: 'Pomidor - balkon', speciesId: tomato.id, userId: user1.id, currentWater: 80 },
      { name: 'Kaktus - kuchnia', speciesId: cactus.id, userId: user1.id, currentWater: 95 },
    ],
  });

  // Create plants for user2
  await prisma.plant.createMany({
    data: [
      { name: 'Paprotka - biuro', speciesId: fern.id, userId: user2.id, currentWater: 60 },
      { name: 'Róża - ogród', speciesId: rose.id, userId: user2.id, currentWater: 45 },
      { name: 'Dead Plant', speciesId: tomato.id, userId: user2.id, currentWater: 0, isDead: true },
    ],
  });

  // user3 starts with no plants (new user scenario)

  // Create some logs
  await prisma.log.createMany({
    data: [
      { message: 'System started', level: 'INFO' },
      { message: 'Database seeded', level: 'INFO' },
    ],
  });

  console.log('✅ Seed completed!');
  console.log('Users: user1, user2, user3 (password: user123)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });