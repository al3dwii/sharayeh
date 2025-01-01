// src/app/(main)/dashboard/page.tsx

import CreatePresentation from '@/components/custom/CpClientWrapper';
import { FileTableWithPagination } from '@/components/custom/FileTableWithPagination';
import { getUserFiles } from '@/lib/queries';
import { auth } from '@clerk/nextjs';
import { UserInfo } from "./UserInfo";

import React from 'react'

const DashboardPage = async() => {
    const { userId } = auth();


  if (!userId) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold">Please log in to view this page.</p>
      </div>
    );
  }

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
    <>
    <div className="m-2 p-2 mt-14">
    <UserInfo  />
    <div className="m-2 p-2">
    <CreatePresentation />
    </div>
    <FileTableWithPagination userFiles={serializedUserFiles} />
    </div>
    </>
  )
}

export default DashboardPage;
