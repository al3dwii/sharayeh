// prisma/seed.js

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const plans = [
    {
      id: 'cm4kcbd6t00007ndb3r9dydrc', 
      name: 'Free',
      price: 0,
      stripePriceId: 'price_1QVtmXAlDgxzsK9aFXzqJmSy', 
      credits: 200,
      presentations: 2,
      slidesPerPresentation: 5,
      canAddTransition: true,
      canUploadPDF: false,
      tier: 'FREE', 
    },
    {
      id: 'cm4kcbe5u00017ndbe7dphuoo', 
      name: 'Standard',
      price: 10,
      stripePriceId: 'price_1QVtn7AlDgxzsK9aupXkenzq', 
      credits: 300,
      presentations: 3,
      slidesPerPresentation: 10,
      canAddTransition: false,
      canUploadPDF: false,
      tier: 'STANDARD', 
    },
    {
      id: 'cm4kcbeop00027ndbbg8k20me', 
      name: 'Premium',
      price: 25,
      stripePriceId: 'price_1QVtnTAlDgxzsK9aWNXCKGqT', 
      credits: 500,
      presentations: 5,
      slidesPerPresentation: 20,
      canAddTransition: true,
      canUploadPDF: true,
      tier: 'PREMIUM', 
    },
  ];

  for (const plan of plans) {
    await prisma.subscriptionPlan.upsert({
      where: { id: plan.id },
      update: {
        // Optionally, update fields if needed
        name: plan.name,
        price: plan.price,
        stripePriceId: plan.stripePriceId,
        credits: plan.credits,
        presentations: plan.presentations,
        slidesPerPresentation: plan.slidesPerPresentation,
        canAddTransition: plan.canAddTransition,
        canUploadPDF: plan.canUploadPDF,
        tier: plan.tier, // Ensure tier is updated
      },
      create: plan,
    });
  }

  console.log('✅ Subscription plans seeded successfully with Stripe Price IDs and Tiers.');
}

main()
  .catch(e => {
    console.error('❌ Seed Error:', e);
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
//       id: 'cm4kcbd6t00007ndb3r9dydrc',
//       name: 'Free',
//       price: 0,
//       credits: 10,
//       presentations: 2,
//       slidesPerPresentation: 5,
//       canAddTransition: true,
//       canUploadPDF: false,
//     },
//     {
//       id: 'cm4kcbe5u00017ndbe7dphuoo',
//       name: 'Standard',
//       price: 10,
//       credits: 100,
//       presentations: 5,
//       slidesPerPresentation: 20,
//       canAddTransition: false,
//       canUploadPDF: false,
//     },
//     {
//       id: 'cm4kcbeop00027ndbbg8k20me',
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
//       where: { id: plan.id },
//       update: {},
//       create: plan,
//     });
//   }

//   console.log('Subscription plans seeded with specified IDs.');
// }

// main()
//   .catch(e => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });


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
