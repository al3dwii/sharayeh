import { db } from '@/lib/db';

export const getApiLimitCount = async (userId: string): Promise<number> => {
  try {
    const userCredits = await db.userCredits.findUnique({
      where: { userId },
      select: { usedCredits: true },
    });

    return userCredits?.usedCredits || 0;
  } catch (error) {
    console.error('Error fetching API limit count:', error);
    return 0;
  }
};
