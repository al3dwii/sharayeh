import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { pricingCards } from '@/lib/constants'
import { stripe } from '@/lib/stripe'
import clsx from 'clsx'
import { Check } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Footer } from "@/components/gadawel/footer";

import {ArrowRight} from "lucide-react";
import { cn } from "@/utils/cn";
import {Button, buttonVariants} from "@/components/ui/custom-button";

import { Hero } from "@/components/gadawel/hero";
import Hvideo from "@/components/gadawel/homevid";
import { Faqs } from "@/components/gadawel/faqs";
import { auth } from '@clerk/nextjs';




export default async function Home() {
  const prices = await stripe.prices.list({
    product: process.env.NEXT_PLURA_PRODUCT_ID,
    active: true,
  })

  const { userId } = auth();


  // if (userId) {
  //   return {
  //     redirect: [
  //       destination: "/dashboard",
  //       permanent: false,
  //     ],
  //   };
  // }

  return (
    <>
      <Hero />
     <Hvideo src="/ge44.mp4" className="w-full m-auto bg-slate-200 flex flex-col md:flex-row justify-around items-center gap-2 p-4 md:p-2 relative" />
      <Faqs /> 

      <section className="bg-secondary w-full flex flex-col md:flex-row justify-around items-center gap-2 p-20 relative">
        <div className="bg-gradient-primary h-full w-full absolute top-0 left-0 z-10" />
        <div className="max-w-[500px] z-[20]">
          <h3 className="text-white capitalize text-[20px] m-0 font-[600] w-[300px]">
            استخدام الذكاء الصناعي في تحويل الملفات الممسوحة ضوئياً والصور
          </h3>
          <p className="text-slate-300 text-[16px] w-full my-5">
            واستخراج الجداول وتحويل إلى الملف وورد قابل للتعديل بجودة عالية
          </p>
        </div>
        <Link href="/sign-up" prefetch={false} className="z-20 w-full max-w-[350px] flex justify-center rounded-xl font-bold">
          <Button
            text="التسجيل"
            className="z-[20] button-primary rounded-xl text-[28px] px-10 font-bold flex justify-center"
          />
        </Link>
      </section>
      <Footer />

    </>
  )
}
