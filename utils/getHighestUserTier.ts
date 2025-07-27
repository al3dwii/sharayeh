// /src/utils/getHighestUserTier.ts

import { db } from '@/lib/db';
import { pricingPlans, Plan } from '@/utils/planConfig';

// Define a union type for user tiers
type Tier = 'free' | 'standard' | 'premium';

// Define the hierarchy of tiers for comparison
const tierHierarchy: Tier[] = ['free', 'standard', 'premium'];

// Utility function to determine the highest tier from a list of tiers
const getHighestTier = (tiers: Tier[]): Tier => {
  const sortedTiers = tiers.sort((a, b) => tierHierarchy.indexOf(a) - tierHierarchy.indexOf(b));
  return sortedTiers[sortedTiers.length - 1];
};

/**
 * Fetches all active user packages and determines the highest subscription tier.
 * @param userId - The ID of the user.
 * @returns The highest subscription tier ('free', 'standard', or 'premium').
 */
export const getHighestUserTier = async (userId: string): Promise<Tier> => {
  const userPackages = await db.userPackage.findMany({
    where: { userId },
    include: { package: { select: { stripePriceId: true, tier: true } } },
  });

  let userTier: Tier = 'free'; // Default tier

  if (userPackages && userPackages.length > 0) {
    const tiers: Tier[] = [];

    for (const userPackage of userPackages) {
      const pkg = userPackage.package;
      if (pkg) {
        const { stripePriceId, tier } = pkg;

        // Find the corresponding plan from pricingPlans
        const plan = pricingPlans.find(
          (plan: Plan) => plan.stripePriceId === stripePriceId
        );

        if (plan) {
          tiers.push(plan.tier.toLowerCase() as Tier);
        } else {
          // Fallback to the tier from the Package model if not found in pricingPlans
          if (tier) {
            tiers.push(tier.toLowerCase() as Tier);
          }
          console.warn('No matching Plan found for stripePriceId:', stripePriceId);
        }
      }
    }

    if (tiers.length > 0) {
      // Determine the highest tier
      userTier = getHighestTier(tiers);
    } else {
      console.warn('No valid tiers found in user packages.');
    }
  } else {
    console.warn('No active packages found for userId:', userId);
  }

  console.log('🟢 User Tier:', userTier);
  return userTier;
};
