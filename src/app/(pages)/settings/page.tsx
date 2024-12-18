// src/app/(main)/dashboard/page.tsx

import React from 'react';
import CreatePresentation from '@/components/custom/CpClientWrapper';
import { FileTableWithPagination } from '@/components/custom/FileTableWithPagination';
import { getUserFiles } from '@/lib/queries';
import { auth } from '@clerk/nextjs';
import { DashboardShell } from '@/components/custom/shell';
import { Footer } from "@/components/gadawel/footer";
import { UserSetting } from "./UserSetting";
import { checkSubscription } from "@/lib/subscription";
import ClientToast from "@/components/custom/ClientToast";


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
    <div className="md:mr-60 p-2 mt-2 grid grid-rows-[auto,1fr,auto] min-h-screen">

    {/* <div className="md:mr-60 p-2 mt-2"> */}
      <DashboardShell>
        <div className="mr-4 ml-4">
          <div className="  w-full md:flex-row md:space-x-4 space-y-4 md:space-y-0">
            <div className="">
              <UserSetting isPro={isPro} />
            </div>
            <div className="flex-1">
            </div>
          </div>
          
          
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

