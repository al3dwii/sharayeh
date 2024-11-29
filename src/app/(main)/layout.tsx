

import Navbar from '@/components/custom/Navbar'
import Navigation from '@/components/site/navigation'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
      <main className="h-full">
<header className="sticky top-0 z-40  bg-primary">
        <div className="container flex h-16 items-center justify-between py-2">
        <Navbar />

        </div>
      </header>       
       {children}
      </main>
  )
}

export default layout
