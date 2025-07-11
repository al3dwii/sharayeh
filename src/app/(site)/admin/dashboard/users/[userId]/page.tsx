// src/app/(main)/admin/dashboard/users/[userId]/page.tsx

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { clerkClient } from '@clerk/nextjs/server';
import { db } from '@/lib/db';

import UserProfileCard from '@/components/user-detail/user-info-card';
import { AccountInfoCard } from '@/components/user-detail/account-info-card';
import { CreditsCard } from '@/components/user-detail/credits-card';
// import { PackageCard } from '@/components/user-detail/package-card';
import { FilesCard } from '@/components/user-detail/files-card';

interface UserDetailPageProps {
  params: { userId: string };
}

/* ------------------------------------------------------------------ */
/* Helper: fetch everything we need about this user                    */
/* ------------------------------------------------------------------ */
async function getUserData(userId: string) {
  const clerk = await clerkClient(); // Clerk v6: function → instance

  const [user, userCredits, userPackages, userFiles] = await Promise.all([
    // 🔽 add a return-type annotation so TS knows this yields `null`
    clerk.users.getUser(userId).catch((): null => null),
    db.userCredits.findUnique({ where: { userId } }),
    db.userPackage.findMany({
      where: { userId },
      include: { package: true },
    }),
    db.file.findMany({ where: { userId } }),
  ]);

  if (!user) notFound();

  return { user, userCredits, userPackages, userFiles };
}

/* ------------------------------------------------------------------ */
/* Page component                                                      */
/* ------------------------------------------------------------------ */
export default async function UserDetailPage({ params }: UserDetailPageProps) {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="bg-background border-b">
        <div className="container mx-auto flex items-center justify-between p-4">
          <h1 className="text-2xl font-bold">User Management</h1>
        </div>
      </header>

      <Suspense fallback={<div className="flex-1 p-6">Loading user data...</div>}>
        <UserData userId={params.userId} />
      </Suspense>

      <footer className="bg-background border-t">
        <div className="container mx-auto p-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Company Name. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Child that renders the cards once data is ready                     */
/* ------------------------------------------------------------------ */
async function UserData({ userId }: { userId: string }) {
  const { user, userCredits, userPackages, userFiles } = await getUserData(userId);

  return (
    <main className="container mx-auto flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
      <div className="grid gap-6 md:grid-cols-2">
        <UserProfileCard user={user} />
        <AccountInfoCard user={user} />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CreditsCard userCredits={userCredits} />
        {/* {userPackages.map(pkg => (
          <PackageCard key={pkg.id} userPackage={pkg} />
        ))} */}
      </div>

      <FilesCard userFiles={userFiles} userId={user.id} />
    </main>
  );
}


// import { Suspense } from 'react';
// import { notFound } from 'next/navigation';
// import { clerkClient } from '@clerk/nextjs/server';
// import { db } from '@/lib/db';

// import UserProfileCard from '@/components/user-detail/user-info-card';
// import { AccountInfoCard } from '@/components/user-detail/account-info-card';
// import { CreditsCard } from '@/components/user-detail/credits-card';
// // import { PackageCard } from '@/components/user-detail/package-card';
// import { FilesCard } from '@/components/user-detail/files-card';

// interface UserDetailPageProps {
//   params: {
//     userId: string;
//   };
// }

// async function getUserData(userId: string) {
//   const [user, userCredits, userPackages, userFiles] = await Promise.all([
//     clerkClient.users.getUser(userId).catch(() => null),
//     db.userCredits.findUnique({ where: { userId } }),
//     db.userPackage.findMany({
//       where: { userId },
//       include: { package: true }, // Include package details
//     }),
//     db.file.findMany({ where: { userId } }),
//   ]);

//   if (!user) {
//     notFound();
//   }

//   return { user, userCredits, userPackages, userFiles };
// }

// export default async function UserDetailPage({ params }: UserDetailPageProps) {
//   return (
//     <div className="flex min-h-screen w-full flex-col">
//       <header className="bg-background border-b">
//         <div className="container mx-auto flex items-center justify-between p-4">
//           <h1 className="text-2xl font-bold">User Management</h1>
//         </div>
//       </header>

//       <Suspense fallback={<div className="flex-1 p-6">Loading user data...</div>}>
//         <UserData userId={params.userId} />
//       </Suspense>

//       <footer className="bg-background border-t">
//         <div className="container mx-auto p-4 text-center text-sm text-muted-foreground">
//           &copy; {new Date().getFullYear()} Company Name. All rights reserved.
//         </div>
//       </footer>
//     </div>
//   );
// }

// async function UserData({ userId }: { userId: string }) {
//   const { user, userCredits, userPackages, userFiles } = await getUserData(userId);

//   return (
//     <main className="container mx-auto flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
//       <div className="grid gap-6 md:grid-cols-2">
//         <UserProfileCard user={user} />
//         <AccountInfoCard user={user} />
//       </div>
//       <div className="grid gap-6 md:grid-cols-2">
//         <CreditsCard userCredits={userCredits} />
//         {/* {userPackages.map((userPackage) => (
//           <PackageCard key={userPackage.id} userPackage={userPackage} />
//         ))} */}
//       </div>
//       <FilesCard userFiles={userFiles} userId={user.id} /> {/* Pass userId if needed for actions */}
//     </main>
//   );
// }

// // pages/user/[userId]/page.tsx

// import { Suspense } from 'react';
// import { notFound } from 'next/navigation';
// import { clerkClient } from '@clerk/nextjs/server';
// import { db } from '@/lib/db';

// import UserProfileCard from '@/components/user-detail/user-info-card';
// import { AccountInfoCard } from '@/components/user-detail/account-info-card';
// // import { CreditsCard } from '@/components/user-detail/credits-card';
// // import { PackageCard } from '@/components/user-detail/package-card'; // Replace SubscriptionCard with PackageCard
// import { CreditsCard } from '@/components/user-detail/credits-card';
// import { FilesCard } from '@/components/user-detail/files-card';
// import { PackageCard } from '@/components/user-detail/subscription-card';

// interface UserDetailPageProps {
//   params: {
//     userId: string;
//   };
// }

// async function getUserData(userId: string) {
//   const [user, userCredits, userPackage, userFiles] = await Promise.all([
//     clerkClient.users.getUser(userId).catch(() => null),
//     db.userCredits.findUnique({ where: { userId } }),
//     db.userPackage.findUnique({
//       where: { userId },
//       include: { package: true }, // Include package details
//     }),
//     db.file.findMany({ where: { userId } }),
//   ]);

//   if (!user) {
//     notFound();
//   }

//   return { user, userCredits, userPackage, userFiles };
// }

// export default async function UserDetailPage({ params }: UserDetailPageProps) {
//   return (
//     <div className="flex min-h-screen w-full flex-col">
//       <header className="bg-background border-b">
//         <div className="container mx-auto flex items-center justify-between p-4">
//           <h1 className="text-2xl font-bold">User Management</h1>
//         </div>
//       </header>

//       <Suspense fallback={<div className="flex-1 p-6">Loading user data...</div>}>
//         <UserData userId={params.userId} />
//       </Suspense>

//       <footer className="bg-background border-t">
//         <div className="container mx-auto p-4 text-center text-sm text-muted-foreground">
//           &copy; {new Date().getFullYear()} Company Name. All rights reserved.
//         </div>
//       </footer>
//     </div>
//   );
// }

// async function UserData({ userId }: { userId: string }) {
//   const { user, userCredits, userPackage, userFiles } = await getUserData(userId);

//   return (
//     <main className="container mx-auto flex flex-1 flex-col gap-6 p-4 md:gap-8 md:p-8">
//       <div className="grid gap-6 md:grid-cols-2">
//         <UserProfileCard user={user} />
//         <AccountInfoCard user={user} />
//       </div>
//       <div className="grid gap-6 md:grid-cols-2">
//         <CreditsCard userCredits={userCredits} />
//         <PackageCard userPackage={userPackage} /> 
//        {/* <SubscriptionCard userPackage={userPackage} /> */}

//       </div>
//       <FilesCard userFiles={userFiles} userId={user.id} /> {/* Pass userId if needed for actions */}
//     </main>
//   );
// }


