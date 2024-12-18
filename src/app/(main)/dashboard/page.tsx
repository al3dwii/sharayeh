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

    {/* <div className="md:mr-60 p-2 mt-2"> */}
      <DashboardShell>
        <div className="mr-4 ml-4">
          <div className="  w-full md:flex-row md:space-x-4 space-y-4 md:space-y-0">
            <div className="">
              <UserInfo isPro={isPro} />
            </div>
            <div className="flex-1">
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



// // src/app/(main)/dashboard/page.tsx

// import React from 'react';
// // import dynamic from 'next/dynamic';
// // import ServiceCard from '@/components/custom/ServiceCard';
// // import HeroSection from '@/components/custom/HeroSection';
// // import { Download, ImageIcon } from "lucide-react";
// import CreatePresentation from '@/components/custom/CpClientWrapper';
// // import { BilandPages } from '@/components/custom/BilandPages';
// import { FileTableWithPagination } from '@/components/custom/FileTableWithPagination';
// import { getUserFiles } from '@/lib/queries';
// import { auth } from '@clerk/nextjs';
// import { DashboardShell } from '@/components/custom/shell';
// import { Footer } from "@/components/gadawel/footer";
// // import { PhotoIcon } from '@heroicons/react/24/outline';
// import { FreeCounter } from "@/components/custom/free-counter";
// // import { Subsicription } from "@/components/custom/Subsicription";
// import { checkSubscription } from "@/lib/subscription";
// // import toast from 'react-hot-toast';
// import ClientToast from "@/components/custom/ClientToast";

// // import { UserFile } from '@/types/UserFile'; // Import the UserFile interface

// // Dynamically import the C2a component with suspense
// // const C2a = dynamic(() => import('@/components/custom/C2a'), {
// //   suspense: true,
// // });

// const DashboardPage = async () => {
//   const { userId } = auth();

//   const isPro = await checkSubscription();

//   if (!userId) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <p className="text-lg font-semibold">Please log in to view this page.</p>
//       </div>
//     );
//   }

//   // Explicitly type userFiles as an array of UserFile
//   let userFiles: any[] = [];
//   let errorOccurred = false;

//   try {
//     userFiles = await getUserFiles(userId);
//   } catch (error) {
//     console.error("Error fetching user files:", error);
//     errorOccurred = true;
//     userFiles = [];
//   }

//   const serializedUserFiles = userFiles.map((file) => ({
//     ...file,
//     createdAt: file.createdAt.toISOString(),
//   }));

//   return (
//     <div className="md:mr-60 p-2 mt-2">
//       <DashboardShell>
//         <div className="mr-4 ml-4">
//           <div className="  w-full md:flex-row md:space-x-4 space-y-4 md:space-y-0">
//             <div className="">
//               <FreeCounter isPro={isPro} />
//             </div>
//             <div className="flex-1">
//               {/* <Subsicription isPro={isPro} /> */}
//             </div>
//           </div>
          
//           <CreatePresentation />
          
//           <div>
//             <h2 className="justify-center text-ml m-4">ملفاتك</h2>
//             <FileTableWithPagination userFiles={serializedUserFiles} />
//           </div>
//         </div>
//       </DashboardShell>
//       <Footer />
//       {errorOccurred && (
//         <ClientToast message="حدث عطل ما جرب لاحقاً او تواصل معنا" />
//       )}
//     </div>
//   );
// };

// export default DashboardPage;




// // src/app/(main)/dashboard/page.tsx

// import React from 'react';
// import dynamic from 'next/dynamic';
// import ServiceCard from '@/components/custom/ServiceCard';
// import HeroSection from '@/components/custom/HeroSection';
// import { Download, ImageIcon } from "lucide-react";
// import OcrClientWrapper from '@/components/custom/OcrClientWrapper';
// import { BilandPages } from '@/components/custom/BilandPages';
// import { FileTableWithPagination } from '@/components/custom/FileTableWithPagination';
// import { getUserFiles } from '@/lib/queries';
// import { auth } from '@clerk/nextjs'; // Use auth() on the server side
// import { DashboardShell } from '@/components/custom/shell';
// import { Footer } from "@/components/gadawel/footer";
// import { PhotoIcon } from '@heroicons/react/24/outline';

// import { FreeCounter } from "@/components/custom/free-counter";
// import { Subsicription } from "@/components/custom/Subsicription";

// import { checkSubscription } from "@/lib/subscription";
// import toast from 'react-hot-toast';

// import ClientToast from "@/components/custom/ClientToast";



// // Dynamically import the C2a component with suspense
// const C2a = dynamic(() => import('@/components/custom/C2a'), {
//   suspense: true,
// });

// // Define interface for props if needed
// interface DashboardLayoutProps {
//   children?: React.ReactNode;
// }

// const DashboardPage = async () => {


// // const DashboardPage = async () => {
//   const { userId } = auth();

//   const isPro = await checkSubscription();


//   if (!userId) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <p className="text-lg font-semibold">Please log in to view this page.</p>
//       </div>
//     );
//   }

//   let userFiles = [];
//   let errorOccurred = false;

//   try {
//     userFiles = await getUserFiles(userId);
//   } catch (error) {
//     console.error("Error fetching user files:", error);
//     errorOccurred = true;
//     userFiles = [];
//   }


  
//   // let userFiles = [];
//   // try {
//   //   userFiles = await getUserFiles(userId);
//   // } catch (error) {
    
//   //   toast("حدث عطل ما جرب لاحقاً او تواصل معنا", {
//   //     icon: '❌',
//   //     style: { backgroundColor: '#f56565', color: '#fff' }, // Customize the toast appearance as needed
//   //   });
//   //       console.error('Error fetching user files:', error);
//   //   userFiles = [];
//   // }

//   const serializedUserFiles = userFiles.map((file) => ({
//     ...file,
//     createdAt: file.createdAt.toISOString(),
//   }));

//   return (

//     <div className="md:mr-60 p-2 mt-2">
//   <DashboardShell>
//     <div className="mr-12 ml-12">
//       <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
//         <div className="flex-1">
//           <FreeCounter isPro={isPro} />
//         </div>
//         <div className="flex-1">
//           <Subsicription isPro={isPro} />
//         </div>
//       </div>
      
//       <OcrClientWrapper />
      
//       <div>
//         <h2 className="justify-center text-ml m-4">ملفاتك</h2>
//         <FileTableWithPagination userFiles={serializedUserFiles} />
//       </div>
//     </div>
//   </DashboardShell>
//   <Footer />
//   {errorOccurred && (
//         <ClientToast message="حدث عطل ما جرب لاحقاً او تواصل معنا" />
//       )}
// </div>


// //     <div className="md:mr-60 p-2 mt-2">
// //   <DashboardShell>
// //     <div className="mr-12 ml-12">
// //       <div className="flex flex-col md:flex-row md:space-x-4 space-y-4 md:space-y-0">
// //         <Subsicription isPro={isPro} />
// //         <FreeCounter isPro={isPro} />
// //       </div>
      
// //       <OcrClientWrapper />
      
// //       <div>
// //         <h2 className="justify-center text-ml m-4">ملفاتك</h2>
// //         <FileTableWithPagination userFiles={serializedUserFiles} />
// //       </div>
// //     </div>
// //   </DashboardShell>
// //   <Footer />
// // </div>

//     // <div className="md:mr-60 p-2 mt-2">
//     //   <DashboardShell>
//     //     <div className="mr-12 ml-12">
//     //     <Subsicription isPro={isPro} />

//     //       {/* <FreeCounter apiLimitCount={apiLimitCount} isPro={isPro} /> */}
//     //       <FreeCounter  isPro={isPro} />

//     //       <OcrClientWrapper />
//     //       <div>
//     //         <h2 className="justify-center text-ml m-4">ملفاتك</h2>
//     //         <FileTableWithPagination userFiles={serializedUserFiles} />
//     //       </div>
//     //     </div>
//     //   </DashboardShell>
//     //   <Footer />
//     // </div>
//   );
// };

// export default DashboardPage;


// Convert DashboardPage to an async function and fix syntax
// const DashboardPage = async ({
//   apiLimitCount = 0,
//   isPro = false
// }: {
//   apiLimitCount: number;
//   isPro: boolean;
// }) => {
  
//   // Authenticate the user on the server side
//   const { userId } = auth();

//   if (!userId) {
//     // Handle unauthenticated state
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <p className="text-lg font-semibold">Please log in to view this page.</p>
//       </div>
//     );
//   }


//   const freeTrial = await checkUserCredits()

//   if (!freeTrial) {

//     return new NextResponse ("free trial has expired. ", { status : 403});

//   }


//   await incrementUserCredits();


//   // Fetch user files on the server
//   let userFiles = [];
//   try {
//     userFiles = await getUserFiles(userId);
//   } catch (error) {
//     console.error('Error fetching user files:', error);
//     // Handle the error appropriately
//     userFiles = [];
//   }

//   // Serialize userFiles to avoid passing non-serializable data to client components
//   const serializedUserFiles = userFiles.map((file) => ({
//     ...file,
//     createdAt: file.createdAt.toISOString(),
//     // Serialize other Date fields if necessary
//   }));

//   return (
//     <div className="md:mr-60 p-2 mt-2">
//       <DashboardShell>
//         <div className="mr-12 ml-12">
//           {/* <BilandPages userId={userId} /> */}
//           <FreeCounter 
//         apiLimitCount={apiLimitCount} 
//         isPro={isPro}
//       />

//           <OcrClientWrapper />

//           <div>
//             <h2 className="justify-center text-ml m-4">ملفاتك</h2>
//             {/* Pass serializedUserFiles as a prop to the client component */}
//             <FileTableWithPagination userFiles={serializedUserFiles} />
//           </div>
//         </div>
//       </DashboardShell>
//       <Footer />
//     </div>
//   );
// }

// export default DashboardPage;


// import React from 'react';
// import dynamic from 'next/dynamic';
// import ServiceCard from '@/components/custom/ServiceCard';
// import HeroSection from '@/components/custom/HeroSection';
// import { Download, ImageIcon } from "lucide-react";
// import OcrClientWrapper from '@/components/custom/OcrClientWrapper';
// import { BilandPages } from '@/components/custom/BilandPages';
// import { FileTableWithPagination } from '@/components/custom/FileTableWithPagination';
// import { getUserFiles } from '@/lib/queries';
// import { auth } from '@clerk/nextjs'; // Use auth() on the server side
// import { DashboardShell } from '@/components/custom/shell';
// import { Footer } from "@/components/gadawel/footer";
// import { PhotoIcon } from '@heroicons/react/24/outline';

// const C2a = dynamic(() => import('@/components/custom/C2a'), {
//   suspense: true,
// });

// interface DashboardLayoutProps {
//   children?: React.ReactNode;
// }


// const DashboardPage = () => {{
  
//   // Authenticate the user on the server side
//   const { userId } = auth();

//   if (!userId) {
//     // Handle unauthenticated state
//     return (
//       <div className="flex justify-center items-center h-screen">
//         <p className="text-lg font-semibold">Please log in to view this page.</p>
//       </div>
//     );
//   }

//   // Fetch user files on the server
//   let userFiles = [];
//   try {
//     userFiles = await getUserFiles(userId);
//   } catch (error) {
//     console.error('Error fetching user files:', error);
//     // Handle the error appropriately
//     userFiles = [];
//   }

//   // Serialize userFiles to avoid passing non-serializable data to client components
//   const serializedUserFiles = userFiles.map((file) => ({
//     ...file,
//     createdAt: file.createdAt.toISOString(),
//     // Serialize other Date fields if necessary
//   }));

//   return (
//     <div className="md:mr-60 p-2 mt-2">
//       <DashboardShell>
//         <div className="mr-12 ml-12">
//           <BilandPages userId={userId} />

//           <OcrClientWrapper />

//           <div>
//             <h2 className="justify-center text-ml m-4">ملفاتك</h2>
//             {/* Pass serializedUserFiles as a prop to the client component */}
//             <FileTableWithPagination userFiles={serializedUserFiles} />
//           </div>
//         </div>
//       </DashboardShell>
//       <Footer />
//     </div>
//   );
// }

// export default DashboardPage;


// import React from 'react';
// import dynamic from 'next/dynamic';
// import ServiceCard from '@/components/custom/ServiceCard';
// import HeroSection from '@/components/custom/HeroSection';
// import { Download, ImageIcon } from "lucide-react";
// import OcrClientWrapper from '@/components/custom/OcrClientWrapper';
// import { BilandPages } from '@/components/custom/BilandPages';
// import { FileTableWithPagination } from '@/components/custom/FileTableWithPagination';
// import { getUserFiles } from '@/lib/queries';
// import { auth } from '@clerk/nextjs'; // Use auth() on the server side
// import { DashboardShell } from '@/components/custom/shell';
// import { Footer } from "@/components/gadawel/footer";
// import { PhotoIcon } from '@heroicons/react/24/outline';

// const C2a = dynamic(() => import('@/components/custom/C2a'), {
//   suspense: true,
// });

// interface DashboardLayoutProps {
//   children?: React.ReactNode;
// }

// export default async function DashboardLayout({
//   children,
// }: DashboardLayoutProps) {
//   // Authenticate the user on the server side
//   const { userId } = auth();

//   console.log('User ID:', userId);

//   if (!userId) {
//     // Handle unauthenticated state
//     return <p>Please log in to view this page.</p>;
//   }

//   // Fetch user files on the server
//   let userFiles = [];
//   try {
//     userFiles = await getUserFiles(userId);
//   } catch (error) {
//     console.error('Error fetching user files:', error);
//     // Handle the error appropriately
//     userFiles = [];
//   }

//   // Serialize userFiles to avoid passing non-serializable data to client components
//   const serializedUserFiles = userFiles.map((file) => ({
//     ...file,
//     createdAt: file.createdAt.toISOString(),
//     // Serialize other Date fields if necessary
//   }));

//   return (
//     <div className="md:mr-60 p-2 mt-2">
//       <DashboardShell>
//         <div className="mr-12 ml-12">
//           <BilandPages userId={userId} />

//           <OcrClientWrapper />

//           <div>
//             <h2 className="justify-center text-ml m-4">ملفاتك</h2>
//             {/* Pass serializedUserFiles as a prop to the client component */}
//             <FileTableWithPagination userFiles={serializedUserFiles} />
//           </div>
//         </div>
//       </DashboardShell>
//       <Footer />
//     </div>
//   );
// }

