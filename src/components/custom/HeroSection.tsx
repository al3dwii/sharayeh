import React from 'react';
// import { Icon } from "lucide-react";
import { cn } from "@/lib/utils";


interface Props {
  title: string,
  subtitle: string
  // icon: Icon,
  iconColor?: string;
  bgColor?: string;
}

export default function HeroSection({  title, subtitle,   iconColor,
  bgColor, }: Props) {
  return (
    <section 
  className="flex bg-gray-100 text-center " 
  id="hero"
>
  {/* Icon container with 1/5 width */}
  <div className="flex-shrink-0 w-1/8">
    {/* <Icon className={cn("w-20 h-20", iconColor)} /> */}
  </div>

  {/* Text container with remaining width */}
  <div className="flex-grow max-w-screen-xl mx-auto">
    <h1 className="text-black text-4xl md:text-4xl lg:text-4xl font-bold">
      {title}
    </h1>
    <h2 className="text-black text-lg md:text-xl lg:text-3xl mt-4">
      {subtitle}
    </h2>
  </div>
</section>
    // <section className="flex-grow bg-gray-100 text-center p-4 pt-8 sm:pt-8 md:p-8 md:pt-10 lg:p-12" id="hero">
    //   <Icon className={cn("w-20 h-20", iconColor)} />
    //   <div className="max-w-screen-xl mx-auto">
     
    //     <h1 className="text-black text-4xl md:text-4xl lg:text-4xl font-bold">
        
    //       {title}
    //     </h1>
    //     <h2 className="text-black text-lg md:text-xl lg:text-3xl mt-4">
    //       {subtitle}
    //     </h2>
    //   </div>
    // </section>
  );
}

