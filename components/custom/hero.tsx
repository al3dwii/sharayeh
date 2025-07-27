// import { ArrowRight } from "lucide-react";
// import { cn } from "@/components/ui/cn";
// import { Button } from "@/components/ui/custom-button";
import { SignedIn, SignedOut } from "@clerk/nextjs";
// import { LocaleLink } from "@/components/LocaleLink";
import Link from 'next/link';
import { HOME_EN, HOME_AR, HomeCopy } from '@/content/home';
import { LOCALES } from '@/utils/i18n';

type Props = { locale: (typeof LOCALES)[number] };

export default function Hero({ locale }: Props) {
    const t: HomeCopy = locale === 'ar' ? HOME_AR : HOME_EN;
      const isAr = locale === 'ar';

  
  return (
    <div dir={isAr ? 'rtl' : 'ltr'} className="bg__image relative flex flex-col text-center items-center justify-center space-y-6 py-20">
      <div className="bg-gradient-primary h-full w-full absolute top-0 left-0 z-10" />

  

      <button
        className="flex mt-10 items-center p-2 text-white justify-center z-20 text-[14px] rounded-full bg-[#3e3469]"
      >
        بوربوينت جاهز بدقة عالية في دقائق 
      </button>
      

      <h1 className="text-white capitalize text-center text-4xl md:text-[60px] z-20 px-10 font-[700] leading-[50px] md:leading-[60px] sm:text-center">
          {t.hero.title}
      </h1>
        <p className="text-slate-300 text-[16px] md:text-[18px] z-20 px-10 text-justify max-w-[920px]">
            {t.hero.subtitle}  </p>   

        {/* <p className="text-gray-600">{t.hero.subtitle}</p> */}
       

     <p className="z-20 max-w-[450px] font-semibold text-center rounded-xl text-yellow-300 text-[16px]">
        سجل وجرب الخدمة مجاناً 
      </p>

       <Link
          href={`/${locale}/dashboard`}
          className="relative z-20 inline-block rounded-lg hover:bg-primary px-6 py-3
                    font-semibold text-white shadow bg-primary/60"
        >
          {t.hero.cta}
        </Link>
     
    </div>
  );
};

// import { ArrowRight } from "lucide-react";
// import { cn } from "@/components/ui/cn";
// import { Button, buttonVariants } from "@/components/ui/custom-button";
// import Link from "next/link";
// import { SignedIn, SignedOut } from "@clerk/nextjs";
// import { LocaleLink } from '@/components/LocaleLink'


// export const Hero = () => {
//     return (
//         <div className={'bg__image relative flex flex-col text-center items-center justify-center space-y-6 py-20'}>
//             <div className={'bg-gradient-primary h-full w-full absolute top-0 left-0 z-10'} />

//             <button
//                 className={"flex mt-10 items-center p-2 text-white justify-center z-20 text-[14px] rounded-full bg-[#3e3469]"}
//             >
//                 بوربوينت جاهز بدقة عالية في دقائق <ArrowRight />
//             </button>
//             <h1 className={'text-white capitalize text-center text-4xl md:text-[60px] z-20 px-10 font-[700] leading-[50px] md:leading-[60px] sm:text-center'}>
//             تحويل ملف وورد إلى بوربوينت بالذكاء الاصطناعي
//             </h1>
//             <p className={'text-slate-300 text-[16px] md:text-[18px] z-20 px-10 text-justify max-w-[920px]'}>       
//                 انشاء عروص بوربوينت كاملة باسخدام الذكاء الصناعي باللغة العربية في دقائق
//             </p>

//             <SignedIn>
                      

//                 <Link href="/dashboard" prefetch={false} className={'z-20 w-full max-w-[350px] flex justify-center rounded-xl font-bold'}>
//                 <LocaleLink href="/dashboard">Dashboard</LocaleLink>
//                     <Button
//                         text={'لوحة التحكم '}
//                         className={'z-20 w-full max-w-[350px] flex justify-center rounded-xl font-bold'}
//                     />
//                 </Link>
//             </SignedIn>

//             <SignedOut>
//                 <Link href="/sign-up" prefetch={false} className={'z-20 w-full max-w-[350px] flex justify-center rounded-xl font-bold'}>
//                     <Button
//                         text={'التسجيل'}
//                         className={'z-20 w-full max-w-[350px] flex justify-center rounded-xl font-bold'}
//                     />
//                 </Link>
//             </SignedOut>

//             <p className={'z-20 max-w-[450px] font-semibold text-center rounded-xl text-yellow-300 text-[16px]'}>
//                 سجل وجرب الخدمة مجاناً 
//             </p>
//         </div>
//     );
// };



// import {ArrowRight} from "lucide-react";
// import { cn } from "@/components/ui/cn";
// import {Button, buttonVariants} from "@/components/ui/custom-button";
// import Link from "next/link";

// export const Hero = () => {
//     return (
//         <div
        
//             className={'bg__image relative flex flex-col text-center items-center justify-center space-y-6 py-20'}>
//             <div className={'bg-gradient-primary h-full w-full absolute top-0 left-0 z-10'}/>

//             <button
//                 className={"flex mt-10 items-center p-2 text-white justify-center z-20 text-[14px] rounded-full bg-[#3e3469]"}
//             >
//                     بوربوينت جاهز بدقة عالية في دقائق <ArrowRight/>
//             </button>
//             <h1 className={'text-white capitalize text-center text-4xl md:text-[60px] z-20 px-10 font-[700] leading-[50px] md:leading-[60px]  sm:text-center'}>
// عروض بوربوينت بالذكاء الصناعي                         </h1>
//                         <p className={'text-slate-300 text-[16px] md:text-[18px] z-20 px-10 text-justify max-w-[920px]'}>       
// انشاء عروص بوربوينت كاملة باسخدام الذكاء الصناعي باللغة العربية في دقائق            </p>
            
           
//         <Link href="/sign-up" prefetch={false} className={'z-20 w-full max-w-[350px] flex justify-center rounded-xl font-bold'}> {/* prefetch={false} to prevent preloading */}

//             <Button
                
//                 text={'التسجيل'}
//                 className={'z-20 w-full max-w-[350px] flex justify-center rounded-xl font-bold'}            />
//                         </Link>

//             <p
//                 className={'z-20 max-w-[450px] font-semibold text-center rounded-xl text-yellow-300 text-[16px]'}
//             >
//                 سجل وجرب الخدمة مجاناً 
//             </p>
//         </div>
//     )
// };

