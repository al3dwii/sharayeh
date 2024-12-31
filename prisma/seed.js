const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Example packages (previously "subscription plans")
  const packages = [
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
      tier: 'FREE', // corresponds to the enum PackageTier
    },
    {
      id: 'cm4kcbe5u00017ndbe7dphuoo',
      name: 'Standard',
      price: 10,
      stripePriceId: 'price_1QaNoBAlDgxzsK9aNcAmhn2W',
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
      stripePriceId: 'price_1QaNnAAlDgxzsK9aWdxLeU5U',
      credits: 500,
      presentations: 5,
      slidesPerPresentation: 20,
      canAddTransition: true,
      canUploadPDF: true,
      tier: 'PREMIUM',
    },
    {
      id: 'cm4kcbeop00027ndbbg8k20mesuper',
      name: 'Super',
      price: 55,
      stripePriceId: 'price_1Qc69GAlDgxzsK9aKuQvYr9s',
      credits: 890,
      presentations: 5,
      slidesPerPresentation: 20,
      canAddTransition: true,
      canUploadPDF: true,
      tier: 'SUPER',
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
        presentations: pkg.presentations,
        slidesPerPresentation: pkg.slidesPerPresentation,
        canAddTransition: pkg.canAddTransition,
        canUploadPDF: pkg.canUploadPDF,
        tier: pkg.tier,
      },
      create: { 
        id: pkg.id, // Explicitly set the ID
        name: pkg.name,
        price: pkg.price,
        stripePriceId: pkg.stripePriceId,
        credits: pkg.credits,
        presentations: pkg.presentations,
        slidesPerPresentation: pkg.slidesPerPresentation,
        canAddTransition: pkg.canAddTransition,
        canUploadPDF: pkg.canUploadPDF,
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
