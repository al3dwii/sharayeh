// src/lib/credits.ts

import { db } from '@/lib/db';
import { TransactionType } from '@prisma/client'; // Import the enum from Prisma Client

/**
 * Logs a credit transaction for a user.
 *
 * @param userId - The ID of the user.
 * @param type - The type of transaction ('DEDUCTION' | 'ADDITION').
 * @param amount - The amount of credits.
 * @param description - A description for the transaction.
 */
export const logCreditTransaction = async (
  userId: string,
  type: TransactionType, // Use the imported enum type
  amount: number,
  description: string
) => {
  try {
    await db.creditTransaction.create({
      data: {
        userId,
        type,
        amount,
        description,
      },
    });
  } catch (error) {
    console.error('Error logging credit transaction:', error);
    // Optionally, handle this error (e.g., retry, alert admin)
  }
};


// // src/lib/credits.ts

// import { db } from '@/lib/db';
// import { TransactionType } from '@prisma/client'; // Import the enum from Prisma Client

// export const logCreditTransaction = async (
//   userId: string,
//   type: TransactionType, // Use the imported enum type
//   amount: number,
//   description: string
// ) => {
//   try {
//     await db.creditTransaction.create({
//       data: {
//         userId,
//         type,
//         amount,
//         description,
//       },
//     });
//   } catch (error) {
//     console.error('Error logging credit transaction:', error);
//     // Optionally, handle this error (e.g., retry, alert admin)
//   }
// };
