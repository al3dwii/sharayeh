import { Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";

import  Button from "@/components/ui/Button2";

const Navbar = () => {
  return (
    <div className="flex items-center ">
      <Button  className="md:hidden">
        <Menu />
      </Button>
      <div className="flex w-full justify-end">
        <UserButton afterSignOutUrl="/" />
      </div>
    </div>
  );
};

export default Navbar;
