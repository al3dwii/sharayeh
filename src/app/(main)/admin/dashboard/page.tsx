import { AdminDashboardCard } from "@/components/admin-dashboard-card"

// export default function AdminDashboard() {
//   return (
//     <div className="p-6">
//       <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
//       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//         <AdminDashboardCard
//           title="Total Users"
//           value="10,482"
//           description="Total number of registered users"
//           trend={12}
//           icon="users"
//         />
//         <AdminDashboardCard
//           title="Revenue"
//           value="$45,231.89"
//           description="Total revenue this month"
//           trend={8}
//           icon="revenue"
//         />
//         <AdminDashboardCard
//           title="Active Projects"
//           value="12"
//           description="Projects currently in progress"
//           trend={-3}
//           icon="projects"
//         />
//       </div>
//     </div>
//   )
// }



// src/app/admin/dashboard/page.tsx

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs';
import { Header } from '@/components/custom/Header';
import { UserTable } from '@/components/custom/UserTable';
import { getAllUsersWithCount } from '@/lib/queries';
import PromoPopup from '@/components/custom/prompt-popup';

export const dynamic = 'force-dynamic';

interface DashboardProps {
  searchParams: {
    page?: string;
    [key: string]: string | undefined;
  };
}

export default async function AdminDashboard({ searchParams }: DashboardProps) {
  const { userId /*, user*/ } = await auth();

  if (!userId /* || !user.roles.includes('admin') */) {
    redirect('/login');
  }

  const page = parseInt(searchParams.page || '1', 10);
  const limit = 10;

  try {
    const { users, totalUsers } = await getAllUsersWithCount(page, limit);

    return (
      <div className="flex min-h-screen w-full flex-col">
        <Header />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AdminDashboardCard
          title="Total Users"
          value="10,482"
          description="Total number of registered users"
          trend={12}
          icon="users"
        />
        <AdminDashboardCard
          title="Revenue"
          value="$45,231.89"
          description="Total revenue this month"
          trend={8}
          icon="revenue"
        />
        <AdminDashboardCard
          title="Active Projects"
          value="12"
          description="Projects currently in progress"
          trend={-3}
          icon="projects"
        />
      </div>
    </div>
          <UserTable
            users={users as unknown as []}
            totalUsers={totalUsers}
            currentPage={page}
            limit={limit}
          />
          <PromoPopup />
        </main>
      </div>
    );
  } catch (error) {
    console.error('Error loading dashboard:', error);
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <p className="text-red-500">Failed to load the dashboard.</p>
      </div>
    );
  }
}


