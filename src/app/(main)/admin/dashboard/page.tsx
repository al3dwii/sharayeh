
// src/app/admin/dashboard/page.tsx

import { redirect } from 'next/navigation';
import { auth } from '@clerk/nextjs';
import { Header } from '@/components/custom/Header';
import { StatsCards } from '@/components/custom/StatsCards';
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

export default async function Dashboard({ searchParams }: DashboardProps) {
  const { userId, user } = await auth();

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
          {/* Conditionally render StatsCards if stats are available */}
          {/* stats && <StatsCards stats={stats} /> */}
          <UserTable
            users={users as unknown as[]}
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
