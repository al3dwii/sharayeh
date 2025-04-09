
import { AdminDashboardCard } from "@/components/admin-dashboard-card";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs";
import { UserTable } from "@/components/custom/UserTable";
import PromoPopup from "@/components/custom/prompt-popup";
import { clerkClient } from "@clerk/nextjs/server";
import {
  getAllUsersWithCount,
  getNewUsersTodayCount,
} from "@/lib/queries"; // <-- Import your new queries

export const dynamic = "force-dynamic";

interface DashboardProps {
  searchParams: {
    page?: string;
    [key: string]: string | undefined;
  };
}

export default async function AdminDashboard({ searchParams }: DashboardProps) {
  // 1. Check if there's an authenticated user
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  try {
    // 2. Check if this user is an admin
    const user = await clerkClient.users.getUser(userId);
    const isAdmin = user.publicMetadata?.isAdmin === true;

    if (!isAdmin) {
      return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-4">Unauthorized</h2>
          <p>You do not have permission to view this page.</p>
        </div>
      );
    }

    // 3. Fetch paginated user list & count
    const page = parseInt(searchParams.page || "1", 10);
    const limit = 10;
    const { users, totalUsers } = await getAllUsersWithCount(page, limit);

    // 4. Fetch number of new users created "today"
    const newUsersToday = await getNewUsersTodayCount();

    // 5. Render admin dashboard
    return (
      <div className="flex min-h-screen w-full flex-col">
        {/* Optionally include a custom Header:
        <Header />
        */}

        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            {/* Two Cards: Total Users & New Users Today */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
              <AdminDashboardCard
                title="Total Users"
                value={String(totalUsers)}
                description="All registered users so far"
                trend={0}     // set to 0 or remove if you don't want a badge
                icon="users"
              />
              <AdminDashboardCard
                title="New Users Today"
                value={String(newUsersToday)}
                description="Number of users who joined since midnight"
                trend={0}     // set to 0 or remove if you don't want a badge
                icon="users"  // or add a new icon variant if you prefer
              />
            </div>
          </div>

          {/* User Table */}
          <UserTable
            users={users as []}
            totalUsers={totalUsers}
            currentPage={page}
            limit={limit}
          />

          {/* Optional promotional popup
          <PromoPopup />
          */}
        </main>
      </div>
    );
  } catch (error) {
    console.error("Error loading dashboard:", error);
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <p className="text-red-500">Failed to load the dashboard.</p>
      </div>
    );
  }
}

// import { AdminDashboardCard } from "@/components/admin-dashboard-card";
// import { redirect } from "next/navigation";
// import { auth } from "@clerk/nextjs";
// import { Header } from "@/components/custom/Header";
// import { UserTable } from "@/components/custom/UserTable";
// import { getAllUsersWithCount } from "@/lib/queries";
// import PromoPopup from "@/components/custom/prompt-popup";
// import { clerkClient } from "@clerk/nextjs/server"; // Ensure server-side operations

// export const dynamic = "force-dynamic";

// interface DashboardProps {
//   searchParams: {
//     page?: string;
//     [key: string]: string | undefined;
//   };
// }

// export default async function AdminDashboard({ searchParams }: DashboardProps) {
//   const { userId } = auth();

//   if (!userId) {
//     // Still okay to redirect unauthenticated users to sign-in
//     redirect("/sign-in");
//   }

//   try {
//     // Fetch the user data from Clerk
//     const user = await clerkClient.users.getUser(userId);

//     // Check if the user has admin privileges
//     const isAdmin = user.publicMetadata?.isAdmin === true;

//     // Instead of redirecting, return a simple "not authorized" UI for non-admins
//     if (!isAdmin) {
//       return (
//         <div className="flex min-h-screen w-full flex-col items-center justify-center">
//           <h2 className="text-2xl font-bold mb-4">Unauthorized</h2>
//           <p>You do not have permission to view this page.</p>
//         </div>
//       );
//     }

//     // Otherwise, render the admin dashboard
//     const page = parseInt(searchParams.page || "1", 10);
//     const limit = 10;

//     const { users, totalUsers } = await getAllUsersWithCount(page, limit);

//     return (
//       <div className="flex min-h-screen w-full flex-col">
//         {/* <Header /> */}
//         <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
//           <div className="p-6">
//             <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
//             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
//               <AdminDashboardCard
//                 title="Total Users"
//                 value="10,482"
//                 description="Total number of registered users"
//                 trend={12}
//                 icon="users"
//               />
//               <AdminDashboardCard
//                 title="Revenue"
//                 value="$45,231.89"
//                 description="Total revenue this month"
//                 trend={8}
//                 icon="revenue"
//               />
//               <AdminDashboardCard
//                 title="Active Projects"
//                 value="12"
//                 description="Projects currently in progress"
//                 trend={-3}
//                 icon="projects"
//               />
//             </div>
//           </div>
//           <UserTable
//             users={users as unknown as []}
//             totalUsers={totalUsers}
//             currentPage={page}
//             limit={limit}
//           />
//           {/* <PromoPopup /> */}
//         </main>
//       </div>
//     );
//   } catch (error) {
//     console.error("Error loading dashboard:", error);
//     return (
//       <div className="flex min-h-screen w-full flex-col items-center justify-center">
//         <p className="text-red-500">Failed to load the dashboard.</p>
//       </div>
//     );
//   }
// }
