
import { ReactNode } from 'react';
import { auth } from '@clerk/nextjs';
import { Sidebar } from '@/components/custom/sidebar';

import { redirect } from 'next/navigation';
import Link from 'next/link'



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


// import Navbar from "@/components/navbar";
// import { Sidebar } from "@/components/custom/sidebar";
// // import { Sidebar } from "@/app/ui/dashboard/sidebar";

// import { checkSubscription } from "@/utils/subscription";
// // import { getApiLimitCount } from "@/utils/api-limit";
// // import { LandingNavbar } from "@/components/landing-navbar";
// import Navigation from '@/components/site/navigation'
// import MobileNav from "@/components/custom/mobilenav";


// const DashboardLayout = async ({
//   children,
// }: {
//   children: React.ReactNode
// }) => {
//   // const apiLimitCount = await getApiLimitCount();
//   // const isPro = await checkSubscription();

//   return ( 
// <>
//     <div className="h-full relative">
//       <div className="hidden  h-full md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 bg-gray-100">
//         <Sidebar isPro={isPro} apiLimitCount={apiLimitCount} />
//         </div>
//       <main >
//         <MobileNav/>
//           {children}
         
//         </main>

      
//     </div>
    
//      </>
   
//    );
// }
 
// export default DashboardLayout;




// <div className="h-full relative">
// {/* <LandingNavbar /> */}

// <main className="flex flex-col">
// {children}
// <div className="hidden  h-full md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 z-80 bg-gray-200">
// <Sidebar isPro={isPro} apiLimitCount={apiLimitCount} />
// </div>
// </main>
// </div>


// import BlurPage from '@/components/global/blur-page'
// import InfoBar from '@/components/global/infobar'
// import Sidebar from '@/components/sidebar'
// import Unauthorized from '@/components/unauthorized'

// import { currentUser } from '@clerk/nextjs'
// import { redirect } from 'next/navigation'
// import React from 'react'

// type Props = {
//   children: React.ReactNode
//   params: { agencyId: string }
// }

// const layout = async ({ children, params }: Props) => {
//   const user = await currentUser()

//   if (!user) {
//     return redirect('/')
//   }

//   // if (!user) {
//   //   return redirect('/agency')
//   // }
 

//   return (
//     <div className="h-screen ">
//       <Sidebar
//         id={user.id}
//       />  
//       <div className="md:pr-[250px]">
       
//         <div className="relative">
        
//             {children}
           
//         </div>
//       </div>
//     </div>
//   )
// }

// export default layout


// import BlurPage from '@/components/global/blur-page'
// import InfoBar from '@/components/global/infobar'
// import Sidebar from '@/components/sidebar'
// import Unauthorized from '@/components/unauthorized'
// import {
//   getNotificationAndUser,
//   verifyAndAcceptInvitation,
// } from '@/lib/queries'
// import { currentUser } from '@clerk/nextjs'
// import { redirect } from 'next/navigation'
// import React from 'react'

// type Props = {
//   children: React.ReactNode
//   params: { agencyId: string }
// }

// const layout = async ({ children, params }: Props) => {
//   const agencyId = await verifyAndAcceptInvitation()
//   const user = await currentUser()

//   if (!user) {
//     return redirect('/')
//   }

//   if (!agencyId) {
//     return redirect('/agency')
//   }

//   // if (
//   //   user.privateMetadata.role !== 'AGENCY_OWNER' &&
//   //   user.privateMetadata.role !== 'AGENCY_ADMIN'
//   // )
//   //   return <Unauthorized />

//   // let allNoti: any = []
//   // const notifications = await getNotificationAndUser(agencyId)
//   // if (notifications) allNoti = notifications

 

//   return (
//     <div className="h-screen overflow-hidden">
//       <Sidebar
//         id={params.agencyId}
//         type="agency"
//       />  
//       <div className="md:pr-[250px]">
//         {/* <InfoBar
//           notifications={allNoti}
//           role={allNoti.User?.role}
//         /> */}
//         <div className="relative">
//           {/* <BlurPage> */}
//             {children}
//             {/* </BlurPage> */}
//         </div>
//       </div>
//     </div>
//   )
// }

// export default layout
