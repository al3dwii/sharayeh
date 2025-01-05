// app/page.tsx

'use client';

import UserProfile from '../../../components/UserProfile';

export default function HomePage() {
  return (
    <main>
      <h1>Welcome to Your Dashboard</h1>
      <UserProfile />
      {/* Other components can also use the useUser hook */}
    </main>
  );
}
