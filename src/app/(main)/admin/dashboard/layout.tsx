// src/app/admin/dashboard/layout.tsx

import React from "react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-layout p-8">
      {children}
    </div>
  );
}
