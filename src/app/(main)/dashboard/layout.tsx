
import { ReactNode } from 'react';
import { auth } from '@clerk/nextjs';
import { Sidebar } from '@/components/custom/sidebar';

import { redirect } from 'next/navigation';


const DashboardLayout = async ({ children }: { children: ReactNode }) => {
  const { userId } = auth();

  if (!userId) {
   
    redirect('/sign-in');
  
  }

  return (
    <>
      <div className="h-full relative">
        <div className="hidden h-full md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 bg-gray-100">
          <Sidebar  />
        </div>
        <main>
       
         
          {children}
        </main>
      </div>
    </>
  );
};

export default DashboardLayout;
