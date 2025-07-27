
"use client";

import Link from "next/link";
import { Montserrat } from "next/font/google";
import { LayoutDashboard, Settings, PackageCheckIcon, LogOut, SubscriptIcon } from "lucide-react"; // Import LogOut icon
import { usePathname, useRouter } from "next/navigation";
import {cn} from '@/components/ui/cn';

import { Tajawal } from "next/font/google";
import { useClerk, useUser } from "@clerk/nextjs"; // Import useClerk and useUser hooks

const tajawal = Tajawal({
  weight: "700",
  subsets: ["latin"],
  display: 'swap',

});

const montserrat = Montserrat({
  weight: "600",
  subsets: ["latin"],
});

const routes = [
  {
    label: "لوحة التحكم",
    icon: LayoutDashboard,
    href: "/dashboard",
    color: "text-sky-500",
  },
  {
    label: "الاعدادات",
    icon: Settings,
    href: "/settings",
    color: "text-gray-500",
  },
  {
    label: "الباقات",
    icon: PackageCheckIcon,
    color: "text-orange-700",
    href: "/pricing",
  },
  // Logout route removed
];

export const Sidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useClerk(); // Access the signOut method
  const { user } = useUser(); // Access user information

  const handleLogout = async () => {
    try {
      await signOut(); // Sign out the user
      router.push("/login"); // Redirect to the login page after logout
    } catch (error) {
      console.error("Error signing out:", error);
      // Optionally, display an error message to the user
    }
  };

  return (
    <aside className="hidden w-64 flex-shrink-0 bg-gray-100 p-4 text-white md:block">
      <div className=" h-full mt-20 text-black">
      <div className="px-3 py-2 flex-1">
        {/* Optional: Display User Information */}
        {user && (
          <div className="mb-4 px-3">
            <p className="text-lg font-semibold">مرحبًا، {user.firstName}</p>
          </div>
        )}

        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-black hover:bg-black/10 rounded-lg transition",
                pathname === route.href ? "text-black bg-black/10" : "bg-white/10"
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 ml-3", route.color)} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-3">
        <button
          onClick={handleLogout}
          className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-black hover:bg-black/10 rounded-lg transition bg-white/10"
          aria-label="تسجيل الخروج"
        >
          <div className="flex items-center bg-blue-300 p-4 flex-1">
            <LogOut className="h-5 w-5 ml-3 text-pink-700" /> {/* Use LogOut icon */}
            تسجيل الخروج
          </div>
        </button>
      </div>
    </div>
    {/* <nav>
      <ul>
        <li className="mb-2 rounded px-4 py-2 hover:bg-gray-700">
          <Link href="/dashboard">Dashboard</Link>
        </li>
        <li className="mb-2 rounded px-4 py-2 hover:bg-gray-700">
          <Link href="/dashboard/analytics">Analytics</Link>
        </li>
        <li className="mb-2 rounded px-4 py-2 hover:bg-gray-700">
          <Link href="/dashboard/settings">Settings</Link>
        </li>
      </ul>
    </nav> */}
  </aside>
    
  );
};





// "use client";

// import Link from "next/link";
// import Image from "next/image";
// import { Montserrat } from 'next/font/google'
// import { Code, ImageIcon, LayoutDashboard, MessageSquare, Music, Settings, VideoIcon } from "lucide-react";
// import { usePathname } from "next/navigation";

// import { cn } from "@/lib/utils";

// import { Tajawal } from 'next/font/google';
// const tajawal = Tajawal({ 
//   weight: '700', 
//   subsets: ['latin']
// });

// const poppins = Montserrat ({ weight: '600', subsets: ['latin'] });

// const routes = [
//   {
//     label: 'لوحة التحكم',
//     icon: LayoutDashboard,
//     href: '/dashboard',
//     color: "text-sky-500"
//   },
//   {
//     label: 'الاعدادات',
//     icon: Settings,
//     href: '/settings',
//   },

//   {
//     label: 'الاشتراك',
//     icon: VideoIcon,
//     color: "text-orange-700",
//     href: '/pricing',
//   },
  
 
//   {
//     label: 'تسجيل الخروج',
//     icon: ImageIcon,
//     color: "text-pink-700",
//     href: '/log-out',
//   },
  
// ];

// export const Sidebar = () => {
//   const pathname = usePathname();

//   return (
//     <div className="space-y-4 py-4 flex flex-col h-full bg-gray-100 mt-14 text-black">
//       <div className="px-3 py-2 flex-1">
  
        
//         <div className="space-y-1">
//           {routes.map((route) => (
//             <Link
//               key={route.href} 
//               href={route.href}
//               className={cn(
//                 "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-black hover:bg-black/10 rounded-lg transition",
//                 pathname === route.href ? "text-black bg-black/10" : "bg-white/10",
//               )}
//             >
//               <div className="flex items-center flex-1">
//                 <route.icon className={cn("h-5 w-5 ml-3", route.color)} />
//                 {route.label}
//               </div>
//             </Link>
//           ))}
//         </div>
//       </div>
  
//     </div>
//   );
// };


