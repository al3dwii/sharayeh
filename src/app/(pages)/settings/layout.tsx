
import { ReactNode } from 'react';
import { auth } from '@clerk/nextjs';
import { Sidebar } from '@/components/custom/sidebar';
import MobileNav from '@/components/custom/mobilenav';
import { checkSubscription } from '@/utils/subscription';
import { getApiLimitCount } from '@/utils/api-limit';
import { redirect } from 'next/navigation';


const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  const { userId } = auth();

  if (!userId) {
    // Handle unauthenticated user
    // For example, redirect to sign-in page
    redirect('/sign-in');
    // throw new Error('User not authenticated');
  }

  const [isPro, apiLimitCount] = await Promise.all([
    checkSubscription(userId),
    getApiLimitCount(userId),
  ]);

  return (
    <>
      <div className="h-full relative">
        <div className="hidden h-full md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 bg-gray-100">
          <Sidebar  />
        </div>
        <main>
          <MobileNav />
          {children}
        </main>
      </div>
    </>
  );
};

export default DashboardLayout;

