"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";

import  Button  from "@/components/ui/Button2";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/custom/sidebar";

export const MobileSidebar = ({
  apiLimitCount = 0,
  isPro = false
}: {
  apiLimitCount: number;
  isPro: boolean;
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Sheet>
      <SheetTrigger>
      <Menu />
        {/* <Button variant="ghost" size="icon" className="md:hidden">
         
        </Button> */}
      </SheetTrigger>
      <SheetContent side="right" className="p-0">
        <Sidebar  />
      </SheetContent>
    </Sheet>
  );
};
