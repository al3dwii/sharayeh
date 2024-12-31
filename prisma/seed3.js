// prisma/seed-packages.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const packages = [
    {
      id: 'pkg_free', 
      name: 'Free Package',
      description: 'Get started with 100 credits',
      price: 0, // Free
      stripePriceId: null, // No Stripe ID for free package
      credits: 100,
    },
    {
      id: 'pkg_300', 
      name: 'Standard Package',
      description: '300 credits package',
      price: 1499, // $14.99
      stripePriceId: 'price_1QaNoBAlDgxzsK9aNcAmhn2W', 
      credits: 300,
    },
    {
      id: 'pkg_600', 
      name: 'Premium Package',
      description: '600 credits package',
      price: 2499, // $24.99
      stripePriceId: 'price_1QaNnAAlDgxzsK9aWdxLeU5U', 
      credits: 600,
    },
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { id: pkg.id },
      update: {
        name: pkg.name,
        description: pkg.description,
        price: pkg.price,
        stripePriceId: pkg.stripePriceId,
        credits: pkg.credits,
      },
      create: pkg,
    });
  }

  console.log('✅ Packages seeded successfully.');
}

main()
  .catch(e => {
    console.error('❌ Seed Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
