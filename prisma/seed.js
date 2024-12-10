// prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      name: 'Free',
      price: 0,
      credits: 10,
      presentations: 2,
      slidesPerPresentation: 5,
      canAddTransition: true,
      canUploadPDF: false,
    },
    {
      name: 'Standard',
      price: 10,
      credits: 100,
      presentations: 5,
      slidesPerPresentation: 20,
      canAddTransition: false,
      canUploadPDF: false,
    },
    {
      name: 'Premium',
      price: 25,
      credits: 450,
      presentations: 15,
      slidesPerPresentation: 30,
      canAddTransition: true,
      canUploadPDF: true,
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { name: plan.name },
      update: {},
      create: plan,
    });
  }

  console.log('Subscription plans seeded.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
