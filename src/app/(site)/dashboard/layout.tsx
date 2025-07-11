// app/dashboard/layout.tsx
import React from 'react'
import { Sidebar } from '@/components/custom/sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="md:flex min-h-screen">
      {/* Sidebar (hidden on small screens, expanded on md+) */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col">
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
