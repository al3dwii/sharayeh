import prismadb from "@/utils/prismadb";
import { auth, clerkClient } from "@clerk/nextjs/server";

// No need for DAY_IN_MS if there's no expiration date
// const DAY_IN_MS = 86_400_000;

export const checkPackage = async () => {

  const { userId } = await auth();          // ← await

  const clerk = await clerkClient();        // ← initialise backend SDK
  const user  = await clerk.users.getUser(userId);


  // If the user is not authenticated
  if (!userId) {
    return false;
  }

  // Fetch the user's credits
  const userPackage = await prismadb.userPackage.findFirst({
    where: { userId },
    select: {
      stripeCustomerId: true,
    },
  });

  // If no credits record or zero credits, assume no active package
  if (!userPackage) {
    return false;
  }

  // If user has credits, consider that valid package access
  return true;
};

