
// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      id: 'cm4kcbd6t00007ndb3r9dydrc',
      name: 'Free',
      price: 0,
      credits: 10,
      presentations: 2,
      slidesPerPresentation: 5,
      canAddTransition: true,
      canUploadPDF: false,
    },
    {
      id: 'cm4kcbe5u00017ndbe7dphuoo',
      name: 'Standard',
      price: 10,
      credits: 100,
      presentations: 5,
      slidesPerPresentation: 20,
      canAddTransition: false,
      canUploadPDF: false,
    },
    {
      id: 'cm4kcbeop00027ndbbg8k20me',
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
      where: { id: plan.id },
      update: {},
      create: plan,
    });
  }

  console.log('Subscription plans seeded with specified IDs.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


// // prisma/seed.js

// const { PrismaClient } = require('@prisma/client');
// const prisma = new PrismaClient();

// async function main() {
//   const plans = [
//     {
//       name: 'Free',
//       price: 0,
//       credits: 10,
//       presentations: 2,
//       slidesPerPresentation: 5,
//       canAddTransition: true,
//       canUploadPDF: false,
//     },
//     {
//       name: 'Standard',
//       price: 10,
//       credits: 100,
//       presentations: 5,
//       slidesPerPresentation: 20,
//       canAddTransition: false,
//       canUploadPDF: false,
//     },
//     {
//       name: 'Premium',
//       price: 25,
//       credits: 450,
//       presentations: 15,
//       slidesPerPresentation: 30,
//       canAddTransition: true,
//       canUploadPDF: true,
//     },
//   ];

//   for (const plan of plans) {
//     await prisma.subscriptionPlan.upsert({
//       where: { name: plan.name },
//       update: {},
//       create: plan,
//     });
//   }

//   console.log('Subscription plans seeded.');
// }

// main()
//   .catch(e => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
