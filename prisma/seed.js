const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const packages = [
    {
      id: 'cm4kcbd6t00007ndb3r9dydrc',
      name: 'Free',
      price: 0,
      stripePriceId: 'price_1QVtmXAlDgxzsK9aFXzqJmSy',
      credits: 150,
      tier: 'FREE', 
    },
    {
      id: 'cm4kcbe5u00017ndbe7dphuoo',
      name: 'Standard',
      price: 10,
      stripePriceId: 'price_1QaNoBAlDgxzsK9aNcAmhn2W',
      credits: 300,
      tier: 'STANDARD',
    },
    {
      id: 'cm4kcbeop00027ndbbg8k20me',
      name: 'Premium',
      price: 25,
      stripePriceId: 'price_1QaNnAAlDgxzsK9aWdxLeU5U',
      credits: 500,
      tier: 'PREMIUM',
    },
    
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { id: pkg.id },
      update: {
        name: pkg.name,
        price: pkg.price,
        stripePriceId: pkg.stripePriceId,
        credits: pkg.credits,
        tier: pkg.tier,
      },
      create: { 
        id: pkg.id, 
        name: pkg.name,
        price: pkg.price,
        stripePriceId: pkg.stripePriceId,
        credits: pkg.credits,
        tier: pkg.tier,
      },
    });
  }

  console.log('✅ Packages seeded successfully.');
}

main()
  .catch((err) => {
    console.error('❌ Seed Error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


