"use client";

import Link from "next/link";
import Image from "next/image";
import { Montserrat } from 'next/font/google'
import { Code, ImageIcon, LayoutDashboard, MessageSquare, Music, Settings, VideoIcon } from "lucide-react";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { FreeCounter } from "@/components/custom/free-counter";

import { Tajawal } from 'next/font/google';
const tajawal = Tajawal({ 
  weight: '700', // or any other valid weight value
  subsets: ['latin']
});

const poppins = Montserrat ({ weight: '600', subsets: ['latin'] });

const routes = [
  {
    label: 'لوحة التحكم',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: "text-sky-500"
  },
  {
    label: 'الاعدادات',
    icon: Settings,
    href: '/settings',
  },

  {
    label: 'الاسعار',
    icon: VideoIcon,
    color: "text-orange-700",
    href: '/pricing',
  },
  
 
  {
    label: 'تسجيل الغروج',
    icon: ImageIcon,
    color: "text-pink-700",
    href: '/log-out',
  },
  
  // {
  //   label: 'الصوت',
  //   icon: Code,
  //   color: "text-green-700",
  //   href: '/voice',
  // },
  // {
  //   label: 'النصوص العربية',
  //   icon: MessageSquare,
  //   href: '/arabictext',
  //   color: "text-violet-500",
  // },

  
  
];

export const Sidebar = ({
  apiLimitCount = 0,
  isPro = false
}: {
  apiLimitCount: number;
  isPro: boolean;
}) => {
  const pathname = usePathname();

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-gray-100 mt-14 text-black">
      <div className="px-3 py-2 flex-1">
      {/* <Link href="/" className="flex items-center ml-4">
      <div className="relative h-8 w-8 ml-2 animate-spin">
        <Image fill alt="Logo" src="/logo.png" />
      </div>
      <h1 className={cn("text-2xl font-bold text-black", tajawal.className)}>
      Gadawel.com      </h1>
    </Link> */}
        
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href} 
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-black hover:bg-black/10 rounded-lg transition",
                pathname === route.href ? "text-black bg-black/10" : "bg-white/10",
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
      <FreeCounter 
        isPro={isPro}
      />
      {/* <FreeCounter 
        apiLimitCount={apiLimitCount} 
        isPro={isPro}
      /> */}
    </div>
  );
};


