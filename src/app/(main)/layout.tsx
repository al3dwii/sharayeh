

import Navbar from '@/components/custom/Navbar'
import React from 'react'
import Link from 'next/link'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
    <Navbar />
      <main className="h-full ">
        
         <nav className="fixed  z-50 top-16 left-0 right-0 bg-blue-50 md:hidden lg:hidden  ">
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
       {children}
      </main>
      </>
  )
}

export default layout
