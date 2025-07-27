// src/components/Navigation.tsx
'use client';
import { Link } from "@/i18n/navigation";

// import Link from 'next/link';
import Image from 'next/image';
import { UserButton, useUser } from '@clerk/nextjs';
// import { LocaleLink } from '@/components/LocaleLink';
// import { LocaleToggle } from '@/components/LocaleToggle';
import LocaleToggle from '@/components/LocaleToggle';


export default function Navigation() {
  const { isSignedIn } = useUser();

  return (
    <header className="fixed top-0 z-50 flex w-full justify-center bg-primary pt-8 backdrop-blur-xl text-black">
      <div className="container flex h-16 items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <div className="relative h-10 w-10 animate-spin">
            <Image
              fill
              alt="Logo"
              src="/logo.png"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <span className="ml-2 text-2xl font-bold text-white">Sharayh</span>
        </Link>

        {/* Main nav */}
        <nav className="hidden md:flex">
          <ul className="flex items-center gap-4 text-white">
            <li>
              <Link href="/pricing">الاشتراك</Link>
            </li>
            <li>
              <Link href="/blog">المدونة</Link>
            </li>
             <li>
              <Link href="/solutions">الحلول</Link>
            </li>
            <li>
              <Link href="/learn">التعلم</Link>
            </li>
          </ul>
        </nav>
              


        {/* Right side: mode, auth, locale */}
        <div className="flex items-center gap-4">
          <LocaleToggle />

          {isSignedIn ? (
            <>
              <Link
                href="/dashboard"
                className="bg-[#7d63ff] text-white py-2 px-3 rounded-md hover:bg-[#7d63ff]/80"
              >
                لوحة التحكم
              </Link>
              <UserButton afterSignOutUrl="/" />
            </>
          ) : (
            <div className="flex gap-2">
              <Link
                href="/sign-up"
                className="bg-[#7859ff] text-white py-2 px-4 rounded-xl hover:bg-[#7859ff]/80"
              >
                التسجيل
              </Link>
              <Link
                href="/sign-in"
                className="bg-[#5f4b8b]/60 text-white py-2 px-4 rounded-xl hover:bg-[#7859ff]/80"
              >
                الدخول
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}


// "use client";

// import { ModeToggle } from '@/components/global/mode-toggle'
// import { UserButton, useUser } from '@clerk/nextjs'
// import Image from 'next/image'
// import Link from 'next/link'
// import React from 'react'

// const Navigation = () => {
//   const { user, isSignedIn } = useUser()

//   return (
    
//     <header className="fixed top-0 z-50 flex w-full justify-center bg-primary backdrop-blur-xl text-black transition-all">
//       <div className="container flex h-16 items-center justify-between gap-2 px-2 md:px-6 lg:px-8">
//         <div className="flex items-center gap-6 space-x-reverse">
//           <Link href="/" className="flex items-center ">
//             <div className="relative h-10 w-10 ml-2 animate-spin">
//               <Image 
//               fill alt="Logo" 
//               src="/logo.png" 
//               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"

//               />
//             </div>
//             <h1 className="text-2xl font-bold text-white">Sharayh</h1>
//           </Link>

//           <nav className="hidden md:flex">
//             <ul className="flex text-white items-center gap-4">
//               <li>
//                 <Link href="/pricing">الاشتراك</Link>
//               </li>
//               <li>
//                 <Link href="/blog">المدونة</Link>
//               </li>
//             </ul>
//           </nav>
//         </div>

//         <div className="flex items-center gap-4 space-x-4">
//           {isSignedIn ? (
//             <>
//               <Link href="/dashboard" className="bg-[#7d63ff] text-[14px] w-[100px] mr-8 text-white py-2 px-3 rounded-md hover:bg-[#7d63ff]/80">
//                 لوحة التحكم
//               </Link>
//               <div className="ml-8">
//                 <UserButton afterSignOutUrl="/" />
//               </div>
//             </>
//           ) : (

// <div className="flex gap-2">
// <Link href="/sign-up" className="bg-[#7859ff] hover:bg-[#7859ff]/80 text-white py-2 px-4 transition duration-300 ease-in-out items-center gap-2 z-20 w-full max-w-[300px] flex justify-center rounded-xl font-bold">
//   التسجيل
// </Link>
// <Link href="/sign-in" className="bg-[#5f4b8b]/60 hover:bg-[#7859ff]/80 text-white py-2 px-4 transition duration-300 ease-in-out items-center gap-2 z-20 w-full max-w-[300px] flex justify-center rounded-xl font-bold">
//    الدخول
// </Link>

// </div>

//             // <div className="flex gap-4">
//             //   <Link href="/sign-up" className="bg-[#8a69ff] w-full text-[12px] text-white py-2 px-2 rounded-md hover:bg-[#8a69ff]/80">
//             //     التسجيل
//             //   </Link>
//             //   <Link href="/sign-in" className="bg-[#5f4b8b] w-full text-[12px] text-white py-2 px-2 rounded-md hover:bg-[#5f4b8b]/80">
//             //     تسجيل الدخول
//             //   </Link>
//             // </div>
//           )}
         
//         </div>
       
//       </div>
      
//     </header>
   
  
//   )
// }

// export default Navigation



// <div className="flex gap-2">
// <Link href="/sign-up" className="bg-[#7859ff] hover:bg-[#7859ff]/80 text-white py-3 px-6 transition duration-300 ease-in-out items-center gap-2 z-20 w-full max-w-[350px] flex justify-center rounded-xl font-bold">
//   التسجيل
// </Link>
// <Link href="/sign-in" className="bg-[#5f4b8b]/60 hover:bg-[#7859ff]/80 text-white py-3 px-6 transition duration-300 ease-in-out items-center gap-2 z-20 w-full max-w-[350px] flex justify-center rounded-xl font-bold">
//    الدخول
// </Link>

// </div>




// import { ModeToggle } from '@/components/global/mode-toggle'
// import { UserButton, useUser } from '@clerk/nextjs'
// import Image from 'next/image'
// import Link from 'next/link'
// import React from 'react'

// const Navigation = () => {
//   const { user } = useUser()

//   return (
//     <header
//       className="sticky top-0 z-40 flex w-full justify-center bg-primary backdrop-blur-xl text-black transition-all"
//     >
//       <div className="container flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
//         <div className="flex items-center gap-6 space-x-reverse">
//           <Link href="/" className="flex items-center ">
//             <div className="relative h-10 w-10 ml-2 animate-spin">
//               <Image fill alt="Logo" src="/logo.png" />
//             </div>
//             <h1 className="text-2xl font-bold text-white">
//               Gadawel
//             </h1>
//           </Link>

//           <nav className="hidden md:flex">
//             <ul className="flex text-white items-center gap-4">
//               <li>
//                 <Link href="/pricing">الاشتراك</Link>
//               </li>
//               <li>
//                 <Link href="/blog">المدونة</Link>
//               </li>
//             </ul>
//           </nav>
//         </div>

//         <div className="flex items-center gap-8 space-x-4">
//           {user ? (
//             <>
//               <Link href="/dashboard" className="bg-[#7d63ff] mr-8 text-white py-2 px-3 rounded-md hover:bg-[#7d63ff]/80">
//                 لوحة التحكم
//               </Link>
//               <div className="ml-8">
//                 <UserButton afterSignOutUrl="/" />
//               </div>
//             </>
//           ) : (
//             <div className="flex gap-4">
//               <Link href="/sign-up" className="bg-[#8a69ff] text-white py-2 px-4 rounded-md hover:bg-[#8a69ff]/80">
//                 التسجيل
//               </Link>
//               <Link href="/sign-in" className="bg-[#5f4b8b] text-white py-2 px-4 rounded-md hover:bg-[#5f4b8b]/80">
//                 تسجيل الدخول
//               </Link>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   )
// }

// export default Navigation


// import { ModeToggle } from '@/components/global/mode-toggle'
// import { UserButton, auth } from '@clerk/nextjs'
// import { User } from '@clerk/nextjs/server'
// import Image from 'next/image'
// import Link from 'next/link'
// import React from 'react'
// import { Suspense } from "react"



// const Navigation = () => {
//   const { user } = auth()

//   return (
//     <header
//       className="sticky top-0 z-40 flex w-full justify-center bg-primary backdrop-blur-xl text-black transition-all"
//     >
//       <div className="container flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
//         <div className="flex items-center gap-6 space-x-reverse">
//           <Link href="/" className="flex items-center ">
//             <div className="relative h-10 w-10 ml-2 animate-spin">
//               <Image fill alt="Logo" src="/logo.png" />
//             </div>
//             <h1 className={"text-2xl font-bold text-white"}>
//               Gadawel
//             </h1>
//           </Link>

//           <nav className="hidden md:flex">
//             <ul className="flex text-white items-center gap-4">
//               <li>
//                 <Link href="/pricing">الاشتراك</Link>
//               </li>
//               <li>
//                 <Link href="/blog">المدونة</Link>
//               </li>
//             </ul>
//           </nav>
//         </div>

//         <div className="flex items-center gap-8 space-x-4">
//           {user ? (
//             <>
//               <Link href="/dashboard" className="bg-[#7d63ff] mr-8 text-white py-2 px-3 rounded-md hover:bg-[#7d63ff]/80">
//                 لوحة التحكم
//               </Link>
//               <div className="ml-8">
//                 <UserButton afterSignOutUrl="/" />
//               </div>
//             </>
//           ) : (
//             <div className="flex gap-4">
//               <Link href="/sign-up" className="bg-[#8a69ff] text-white py-2 px-4 rounded-md hover:bg-[#8a69ff]/80">
//                 التسجيل
//               </Link>
//               <Link href="/sign-in" className="bg-[#5f4b8b] text-white py-2 px-4 rounded-md hover:bg-[#5f4b8b]/80">
//                 تسجيل الدخول
//               </Link>
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   )
// }

// export default Navigation



// import { ModeToggle } from '@/components/global/mode-toggle'
// import { UserButton } from '@clerk/nextjs'
// import { User } from '@clerk/nextjs/server'
// import Image from 'next/image'
// import Link from 'next/link'
// import React from 'react'
// import { Suspense } from "react";


// type Props = {
//   user?: null | User
// }

// const Navigation = ({ user }: Props) => {
//   return (
//     <header
//   className="sticky top-0 z-40 flex w-full justify-center bg-primary backdrop-blur-xl text-black transition-all"
// >
//   <div className="container flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
//   <div className="flex items-center gap-6 space-x-reverse">
//   <Link href="/" className="flex items-center ">
//       <div className="relative h-10 w-10 ml-2 animate-spin">
//         <Image fill alt="Logo" src="/logo.png" />
//       </div>
//       <h1 className={"text-2xl font-bold text-white"}>
//         Gadawel     </h1>
//     </Link>
  

//   <nav className="hidden md:flex">
//     <ul className="flex text-white items-center gap-4">
//       <li>
//         <Link href="/pricing">الاشتراك</Link>
//       </li>
//       <li>
//         <Link href="/blog">المدونة</Link>
//       </li>
//     </ul>
//   </nav>
// </div>

    

//     <div className="flex items-center gap-8 space-x-4">
//       <Link href="/dashboard" className="bg-[#7d63ff] mr-8 text-white py-2 px-3 rounded-md hover:bg-[#7d63ff]/80">
//         لوحة التحكم
//       </Link>
//       <div className="ml-8"> 
//       <UserButton afterSignOutUrl="/" />
//       </div>
//     </div>
//   </div>

// </header>

    
//   )
// }

// export default Navigation


