// src/app/(main)/dashboard/page.tsx

import React from 'react';
import CreatePresentation from '@/components/custom/CpClientWrapper';
import { FileTableWithPagination } from '@/components/custom/FileTableWithPagination';
import { getUserFiles } from '@/lib/queries';
import { auth } from '@clerk/nextjs';
import { DashboardShell } from '@/components/custom/shell';
import { Footer } from "@/components/gadawel/footer";
import { UserInfo } from "./UserInfo";
import { checkSubscription } from "@/lib/subscription";
import ClientToast from "@/components/custom/ClientToast";

import Link from 'next/link'

const DashboardPage = async () => {
  const { userId } = auth();

  const isPro = await checkSubscription();

  if (!userId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">Please log in to view this page.</p>
      </div>
    );
  }

  // Explicitly type userFiles as an array of UserFile
  let userFiles: any[] = [];
  let errorOccurred = false;

  try {
    userFiles = await getUserFiles(userId);
  } catch (error) {
    console.error("Error fetching user files:", error);
    errorOccurred = true;
    userFiles = [];
  }

  const serializedUserFiles = userFiles.map((file) => ({
    ...file,
    createdAt: file.createdAt.toISOString(),
  }));

  return (
    <div className="md:mr-60 p-2 mt-2 min-h-screen">
      <DashboardShell>
        <div className="mr-4 ml-4">
        
          <div className="  w-full md:flex-row md:space-x-4 space-y-4 md:space-y-0">
         
            <div className="mb-12">
            <nav className="fixed top-16 left-0 right-0 bg-blue-50 md:hidden lg:hidden z-50 ">
    <ul className="flex justify-around items-center h-12 px-4">
      <li className="w-1/2">
        <Link 
          href="/pricing" 
          className="flex items-center justify-center w-full h-full text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <div className="text-lg font-semibold">الاشتراك</div>
        </Link>
      </li>
      <div className="h-8 w-px bg-gray-300"></div>
      <li className="w-1/2">
        <Link 
          href="/blog" 
          className="flex items-center justify-center w-full h-full text-gray-600 hover:text-gray-900 transition-colors duration-200"
        >
          <div className="text-lg font-semibold">المدونة</div>
        </Link>
      </li>
    </ul>
  </nav>

  <div className="mt-16">
            
              <UserInfo isPro={isPro} />
            </div>
            <div className="flex-1">
            </div>
          </div>
          </div>
          <CreatePresentation />
          
          <div>
            <h2 className="justify-center text-ml m-4">ملفاتك</h2>
            <FileTableWithPagination userFiles={serializedUserFiles} />
          </div>
        </div>
      </DashboardShell>
      <Footer />
      {errorOccurred && (
        <ClientToast message="حدث عطل ما جرب لاحقاً او تواصل معنا" />
      )}
    </div>
  );
};

export default DashboardPage;

