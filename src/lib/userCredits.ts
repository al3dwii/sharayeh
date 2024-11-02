import { auth } from "@clerk/nextjs";

import { db } from "@/lib/db";
import { MAX_FREE_COUNTS } from "@/constants";

export const incrementUserCredits = async () => {
  const { userId } = auth();

  if (!userId) {
    return;
  }

  const userCredits = await db.userCredits.findUnique({
    where: { userId: userId },
  });

  if (userCredits) {
    await db.userCredits.update({
      where: { userId: userId },
      data: { credits: userCredits.credits + 1 },
    });
  } else {
    await db.userCredits.create({
      data: { userId: userId, credits: 1 },
    });
  }
};

export const checkUserCredits = async () => {
  const { userId } = auth();

  if (!userId) {
    return false;
  }

  const userCredits = await db.userCredits.findUnique({
    where: { userId: userId },
  });

  if (!userCredits || userCredits.credits < MAX_FREE_COUNTS) {
    return true;
  } else {
    return false;
  }
};

export const getUserCredits = async () => {
  const { userId } = auth();

  if (!userId) {
    return 0;
  }

  const userCredits = await db.userCredits.findUnique({
    where: {
      userId
    }
  });

  if (!userCredits) {
    return 0;
  }

  return userCredits.credits;
};
