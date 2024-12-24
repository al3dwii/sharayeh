

import Navbar from '@/components/custom/Navbar'
import React from 'react'
import { Footer } from "@/components/gadawel/footer";


const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
    <Navbar />

      <main className="h-full ">

{/* <header className="sticky top-0 z-40  bg-primary">
        <div className="container flex h-16 items-center justify-between py-2">

        </div>
      </header>        */}
       {children}
      </main>
      </>     
  )
}

export default layout
