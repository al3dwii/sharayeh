import { db } from "@/lib/db"; // Ensure this points to your Prisma client instance

export type UserData = {
  userCredits: {
    id: number;
    userId: string;
    credits: number;
    usedCredits: number;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  userPackages: Array<{
    id: string;
    userId: string;
    packageId: string;
    stripeCustomerId: string;
    acquiredAt: Date;
    expiresAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    package: {
      id: string;
      name: string;
      price: number;
      stripePriceId: string;
      credits: number;
      tier: string; // e.g. "FREE" | "STANDARD" | "PREMIUM"
      createdAt: Date;
      updatedAt: Date;
    };
  }> | null;
  creditTransactions: Array<{
    id: number;
    userId: string;
    type: string;  // TransactionType
    amount: number;
    description: string;
    timestamp: Date;
  }> | null;
  files: Array<{
    id: number;
    userId: string;
    createdAt: Date;
    fileKey: string | null;
    fileUrl: string | null;
    fileName: string;
    uniqueName: string;
    type: string;
    resultedFile: string | null;
    resultedFile2: string | null;
    status: string; // FileStatus
    results: any | null;
    fileGenerations: Array<{
      requestId: string;
      fileId: number;
      status: string; // GenerationStatus
      downloadUrl: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>;
  }> | null;

  /** The highest tier across all packages (e.g. "FREE", "STANDARD", or "PREMIUM") */
  userTier?: string;

  /** Indicates if the user is a super admin */
  isSuperAdmin: boolean;
} | null;

/**
 * Fetches all relevant data for the specified user, including the highest tier and super admin status.
 *
 * @param {string} userId - The unique identifier of the user.
 * @returns {Promise<UserData>} The aggregated user data or null if no data is found.
 */
export async function getAllUserData(userId: string): Promise<UserData> {
  // 1) Fetch UserCredits
  const userCredits = await db.userCredits.findUnique({
    where: { userId },
    select: {
      id: true,
      userId: true,
      credits: true,
      usedCredits: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // 2) Fetch UserPackages with Package details
  const userPackages = await db.userPackage.findMany({
    where: { userId },
    include: {
      package: {
        select: {
          id: true,
          name: true,
          price: true,
          stripePriceId: true,
          credits: true,
          tier: true,    // "FREE" | "STANDARD" | "PREMIUM"
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  // 3) Determine the highest tier
  // We’ll map each tier to a numeric level for easy comparison:
  const TIER_ORDER: { [key: string]: number } = {
    FREE: 1,
    STANDARD: 2,
    PREMIUM: 3,
  };

  let userTier: string = "FREE"; // Default tier if no packages
  if (userPackages && userPackages.length > 0) {
    for (const up of userPackages) {
      const currentTierLevel = TIER_ORDER[userTier];
      const packageTierLevel = TIER_ORDER[up.package.tier] || 0;
      if (packageTierLevel > currentTierLevel) {
        userTier = up.package.tier;
      }
    }
  }

  // 4) Fetch CreditTransactions
  const creditTransactions = await db.creditTransaction.findMany({
    where: { userId },
    orderBy: { timestamp: "desc" },
    select: {
      id: true,
      userId: true,
      type: true,
      amount: true,
      description: true,
      timestamp: true,
    },
  });

  // 5) Fetch Files with FileGenerations
  const files = await db.file.findMany({
    where: { userId },
    include: {
      fileGenerations: {
        select: {
          requestId: true,
          fileId: true,
          status: true,
          downloadUrl: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  // 6) Check if the user is a super admin via the database
  const superAdmin = await db.superAdmin.findUnique({
    where: { userId },
  });
  const isSuperAdmin = !!superAdmin;

  // 7) Return everything, including the highest tier and super admin flag
  return {
    userCredits,
    userPackages,
    creditTransactions,
    files,
    userTier, // The highest tier across all packages
    isSuperAdmin, // New flag
  };
}


// import { db } from "@/lib/db"; // Ensure this points to your Prisma client instance

// export type UserData = {
//   userCredits: {
//     id: number;
//     userId: string;
//     credits: number;
//     usedCredits: number;
//     createdAt: Date;
//     updatedAt: Date;
//   } | null;
//   userPackages: Array<{
//     id: string;
//     userId: string;
//     packageId: string;
//     stripeCustomerId: string;
//     acquiredAt: Date;
//     expiresAt: Date | null;
//     createdAt: Date;
//     updatedAt: Date;
//     package: {
//       id: string;
//       name: string;
//       price: number;
//       stripePriceId: string;
//       credits: number;
//       tier: string; // e.g. "FREE" | "STANDARD" | "PREMIUM"
//       createdAt: Date;
//       updatedAt: Date;
//     };
//   }> | null;
//   creditTransactions: Array<{
//     id: number;
//     userId: string;
//     type: string;  // TransactionType
//     amount: number;
//     description: string;
//     timestamp: Date;
//   }> | null;
//   files: Array<{
//     id: number;
//     userId: string;
//     createdAt: Date;
//     fileKey: string | null;
//     fileUrl: string | null;
//     fileName: string;
//     uniqueName: string;
//     type: string;
//     resultedFile: string | null;
//     resultedFile2: string | null;
//     status: string; // FileStatus
//     results: any | null;
//     fileGenerations: Array<{
//       requestId: string;
//       fileId: number;
//       status: string; // GenerationStatus
//       downloadUrl: string | null;
//       createdAt: Date;
//       updatedAt: Date;
//     }>;
//   }> | null;

//   /** The highest tier across all packages (e.g. "FREE", "STANDARD", or "PREMIUM") */
//   userTier?: string;
// } | null;

// /**
//  * Fetches all relevant data for the specified user, including the highest tier.
//  *
//  * @param {string} userId - The unique identifier of the user.
//  * @returns {Promise<UserData>} The aggregated user data or null if no data is found.
//  */
// export async function getAllUserData(userId: string): Promise<UserData> {
//   // 1) Fetch UserCredits
//   const userCredits = await db.userCredits.findUnique({
//     where: { userId },
//     select: {
//       id: true,
//       userId: true,
//       credits: true,
//       usedCredits: true,
//       createdAt: true,
//       updatedAt: true,
//     },
//   });

//   // 2) Fetch UserPackages with Package details
//   const userPackages = await db.userPackage.findMany({
//     where: { userId },
//     include: {
//       package: {
//         select: {
//           id: true,
//           name: true,
//           price: true,
//           stripePriceId: true,
//           credits: true,
//           tier: true,    // "FREE" | "STANDARD" | "PREMIUM"
//           createdAt: true,
//           updatedAt: true,
//         },
//       },
//     },
//   });

//   // 3) Determine the highest tier
//   // We’ll map each tier to a numeric level for easy comparison:
//   const TIER_ORDER: { [key: string]: number } = {
//     FREE: 1,
//     STANDARD: 2,
//     PREMIUM: 3,
//   };

//   let userTier: string = "FREE"; // Default tier if no packages
//   if (userPackages && userPackages.length > 0) {
//     for (const up of userPackages) {
//       const currentTierLevel = TIER_ORDER[userTier];
//       const packageTierLevel = TIER_ORDER[up.package.tier] || 0;
//       if (packageTierLevel > currentTierLevel) {
//         userTier = up.package.tier;
//       }
//     }
//   }

//   // 4) Fetch CreditTransactions
//   const creditTransactions = await db.creditTransaction.findMany({
//     where: { userId },
//     orderBy: { timestamp: "desc" },
//     select: {
//       id: true,
//       userId: true,
//       type: true,
//       amount: true,
//       description: true,
//       timestamp: true,
//     },
//   });

//   // 5) Fetch Files with FileGenerations
//   const files = await db.file.findMany({
//     where: { userId },
//     include: {
//       fileGenerations: {
//         select: {
//           requestId: true,
//           fileId: true,
//           status: true,
//           downloadUrl: true,
//           createdAt: true,
//           updatedAt: true,
//         },
//       },
//     },
//   });

//   // 6) Return everything, including the highest tier
//   return {
//     userCredits,
//     userPackages,
//     creditTransactions,
//     files,
//     userTier, // The highest tier across all packages
//   };
// }


// // lib/getAllUserData.ts

// import { db } from '@/lib/db'; // Ensure this points to your Prisma client instance

// export type UserData = {
//   userCredits: {
//     id: number;
//     userId: string;
//     credits: number;
//     usedCredits: number;
//     createdAt: Date;
//     updatedAt: Date;
//   } | null;
//   userPackages: Array<{
//     id: string;
//     userId: string;
//     packageId: string;
//     stripeCustomerId: string;
//     acquiredAt: Date;
//     expiresAt: Date | null;
//     createdAt: Date;
//     updatedAt: Date;
//     package: {
//       id: string;
//       name: string;
//       price: number;
//       stripePriceId: string;
//       credits: number;
//       tier: string;
//       createdAt: Date;
//       updatedAt: Date;
//     };
//   }> | null;
//   creditTransactions: Array<{
//     id: number;
//     userId: string;
//     type: string;
//     amount: number;
//     description: string;
//     timestamp: Date;
//   }> | null;
//   files: Array<{
//     id: number;
//     userId: string;
//     createdAt: Date;
//     fileKey: string | null;
//     fileUrl: string | null;
//     fileName: string;
//     uniqueName: string;
//     type: string;
//     resultedFile: string | null;
//     resultedFile2: string | null;
//     status: string;
//     results: any | null;
//     fileGenerations: Array<{
//       requestId: string;
//       fileId: number;
//       status: string;
//       downloadUrl: string | null;
//       createdAt: Date;
//       updatedAt: Date;
//     }>;
//   }> | null;
// } | null;

// /**
//  * Fetches all relevant data for the specified user.
//  *
//  * @param {string} userId - The unique identifier of the user.
//  * @returns {Promise<UserData>} The aggregated user data or null if no data is found.
//  */
// export async function getAllUserData(userId: string): Promise<UserData> {
//   // Fetch UserCredits
//   const userCredits = await db.userCredits.findUnique({
//     where: { userId },
//     select: {
//       id: true,
//       userId: true,
//       credits: true,
//       usedCredits: true,
//       createdAt: true,
//       updatedAt: true,
//     },
//   });

//   // Fetch UserPackages with Package details
//   const userPackages = await db.userPackage.findMany({
//     where: { userId },
//     include: {
//       package: {
//         select: {
//           id: true,
//           name: true,
//           price: true,
//           stripePriceId: true,
//           credits: true,
//           tier: true,
//           createdAt: true,
//           updatedAt: true,
//         },
//       },
//     },
//   });

//   // Fetch CreditTransactions
//   const creditTransactions = await db.creditTransaction.findMany({
//     where: { userId },
//     orderBy: { timestamp: 'desc' },
//     select: {
//       id: true,
//       userId: true,
//       type: true,
//       amount: true,
//       description: true,
//       timestamp: true,
//     },
//   });

//   // Fetch Files with FileGenerations
//   const files = await db.file.findMany({
//     where: { userId },
//     include: {
//       fileGenerations: {
//         select: {
//           requestId: true,
//           fileId: true,
//           status: true,
//           downloadUrl: true,
//           createdAt: true,
//           updatedAt: true,
//         },
//       },
//     },
//   });

//   return {
//     userCredits,
//     userPackages,
//     creditTransactions,
//     files,
//   };
// }
