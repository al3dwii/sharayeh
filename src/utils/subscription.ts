import prismadb from '@/utils/prismadb';

const DAY_IN_MS = 86_400_000;

export const checkSubscription = async (userId: string): Promise<boolean> => {
  try {
    const subscription = await prismadb.userPackage.findFirst({
      where: { userId },
      select: {
        stripeCustomerId: true,
      },
    });

    if (
      subscription &&
      subscription.stripeCustomerId 
    ) {
      const currentTime = Date.now();

      return ;
    }

    return false;
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
};
