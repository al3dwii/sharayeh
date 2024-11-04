"use client";

import { ModeToggle } from '@/components/global/mode-toggle'
import { UserButton, useUser } from '@clerk/nextjs'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

const Navigation = () => {
  const { user, isSignedIn } = useUser()

  return (
    <header className="sticky top-0 z-40 flex w-full justify-center bg-primary backdrop-blur-xl text-black transition-all">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-6 space-x-reverse">
          <Link href="/" className="flex items-center ">
            <div className="relative h-10 w-10 ml-2 animate-spin">
              <Image fill alt="Logo" src="/logo.png" />
            </div>
            <h1 className="text-2xl font-bold text-white">Sharayh</h1>
          </Link>

          <nav className="hidden md:flex">
            <ul className="flex text-white items-center gap-4">
              <li>
                <Link href="/pricing">الاشتراك</Link>
              </li>
              <li>
                <Link href="/blog">المدونة</Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex items-center gap-8 space-x-4">
          {isSignedIn ? (
            <>
              <Link href="/dashboard" className="bg-[#7d63ff] mr-8 text-white py-2 px-3 rounded-md hover:bg-[#7d63ff]/80">
                لوحة التحكم
              </Link>
              <div className="ml-8">
                <UserButton afterSignOutUrl="/" />
              </div>
            </>
          ) : (
            <div className="flex gap-4">
              <Link href="/sign-up" className="bg-[#8a69ff] text-white py-2 px-4 rounded-md hover:bg-[#8a69ff]/80">
                التسجيل
              </Link>
              <Link href="/sign-in" className="bg-[#5f4b8b] text-white py-2 px-4 rounded-md hover:bg-[#5f4b8b]/80">
                تسجيل الدخول
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navigation



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


