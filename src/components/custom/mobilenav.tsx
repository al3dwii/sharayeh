import { Menu } from "lucide-react";
import  Button  from "@/components/ui/Button2";
import { MobileSidebar } from "./mobile-sidebar";
import { checkSubscription } from '@/utils/subscription';
import { getApiLimitCount } from '@/utils/api-limit';
import { auth } from '@clerk/nextjs';

import { redirect } from 'next/navigation';


const MobileNav = async () => {
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
    <div className="flex items-center ">

      <MobileSidebar isPro={isPro} apiLimitCount={apiLimitCount} />

     
    </div>
  );
};

export default MobileNav;
