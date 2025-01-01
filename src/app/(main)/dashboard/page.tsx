// src/app/(main)/dashboard/page.tsx

import CreatePresentation from '@/components/custom/CpClientWrapper';
import { FileTableWithPagination } from '@/components/custom/FileTableWithPagination';
import { getUserFiles } from '@/lib/queries';
import { auth } from '@clerk/nextjs';
import { DashboardShell } from '@/components/custom/shell';
import { Footer } from "@/components/gadawel/footer";
import { UserInfo } from "./UserInfo";
// import { checkSubscription } from "@/lib/subscription";
import ClientToast from "@/components/custom/ClientToast";
import { Sidebar } from '@/components/custom/sidebar';


import Link from 'next/link'

import React from 'react'

const DashboardPage = async() => {
    const { userId } = auth();

  // const isPro = await checkSubscription();

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

// const DashboardPage = async () => {


//   return (
//     <>
//     <div className="hidden  md:flex md:w-60  bg-gray-100">
        
//         <Sidebar  />
//         </div>
    
//     <div className="md:mr-60 p-2 mt-2 min-h-screen">
   
    
//       {/* <DashboardShell> */}

//         <div className="mr-4 ml-4">

        
//           <div className="  w-full md:flex-row md:space-x-4 space-y-4 md:space-y-0">

         
//             <div className="mb-12">

//   <div className="mt-28">

            
//               <UserInfo  />
//             </div>
//             <div className="flex-1">
//             </div>
//           </div>
//           </div>
//           <CreatePresentation />
          
//           <div>
//             <h2 className="justify-center text-ml m-4">ملفاتك</h2>
//             <FileTableWithPagination userFiles={serializedUserFiles} />
//           </div>
//         </div>
//       {/* </DashboardShell> */}
      
//     </div>
//     {/* <Footer /> */}

//     </>
//   );
// };


