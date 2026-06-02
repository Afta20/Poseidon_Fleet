import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding 10 Crew Accounts...');
  const password = await bcrypt.hash('crew123', 10);
  
  // Create 10 random crew members
  const crewNames = [
    'Ahmad Subarjo',
    'Budi Santoso',
    'Chandra Wijaya',
    'Deni Ramdani',
    'Eko Prasetyo',
    'Fahri Hamzah',
    'Gilang Dirga',
    'Hadi Pratama',
    'Iqbal Ramadhan',
    'Joko Susilo'
  ];

  const positions = ['Captain', 'First Officer', 'Chief Engineer', 'Deckhand', 'Captain', 'First Officer', 'Deckhand', 'Chief Engineer', 'Captain', 'Deckhand'];

  for (let i = 0; i < 10; i++) {
    const user = await prisma.user.upsert({
      where: { email: `crew${i+1}@poseidon.com` },
      update: {},
      create: {
        email: `crew${i+1}@poseidon.com`,
        name: crewNames[i],
        password: password,
        role: 'CREW'
      }
    });

    await prisma.crew.create({
      data: {
        name: crewNames[i],
        position: positions[i],
        userId: user.id
      }
    });
    
    console.log(`Created Crew: ${crewNames[i]} (crew${i+1}@poseidon.com)`);
  }

  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
