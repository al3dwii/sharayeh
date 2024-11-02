import prismadb from '@/utils/prismadb';

const DAY_IN_MS = 86_400_000;

export const checkSubscription = async (userId: string): Promise<boolean> => {
  try {
    const subscription = await prismadb.userSubscription.findUnique({
      where: { userId },
      select: {
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
      },
    });

    if (
      subscription &&
      subscription.stripePriceId &&
      subscription.stripeCurrentPeriodEnd
    ) {
      const periodEndWithGrace = subscription.stripeCurrentPeriodEnd.getTime() + DAY_IN_MS;
      const currentTime = Date.now();

      return periodEndWithGrace > currentTime;
    }

    return false;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
};
