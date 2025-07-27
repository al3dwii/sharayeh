// apps/nextjs/src/components/price/pricing-cards.tsx

"use client";

import { ReactElement } from "react";
import Link from "next/link";
import Balancer from "react-wrap-balancer";
import  Button from "@/components/ui/Button2";
import * as Icons from "@/components/custom/icons";
// import { SubscriptionButton } from "@/components/subscription-button";

export function PricingCards({ userId, isPro }: { userId: string | null; isPro: boolean }) {

  // Hard-coded pricing data
  const pricingPlans = [
    {
      "id": "starter",
      "title": "الخطة الأساسية",
      "price": "9.99$",
      "frequency": "شهرياً",
      "features": [
        "رفع 10 مستندات شهرياً",
        "معالجة OCR الأساسية",
        "دعم عبر البريد الإلكتروني"
      ],
      "limitations": [
        "لا توجد تحليلات متقدمة",
        "سعة تخزين محدودة"
      ]
    },
    {
      "id": "pro",
      "title": "خطة المحترفين",
      "price": "29.99$",
      "frequency": "شهرياً",
      "features": [
        "رفع مستندات غير محدود",
        "معالجة OCR المتقدمة",
        "دعم الأولوية",
        "الوصول إلى التحليلات"
      ],
      "limitations": []
    },
    {
      "id": "pro",
      "title": "خطة المحترفين",
      "price": "29.99$",
      "frequency": "شهرياً",
      "features": [
        "رفع مستندات غير محدود",
        "معالجة OCR المتقدمة",
        "دعم الأولوية",
        "الوصول إلى التحليلات"
      ],
      "limitations": []
    }
    
  ];

  return (
    <section className="container flex flex-col items-center text-center">
      <div className="mx-auto mt-10 flex w-full flex-col gap-5">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          الاشتراكات
        </p>
        <h2 className="font-heading text-3xl leading-[1.1] md:text-5xl">
اختر الباقة المناسبة
        </h2>
      </div>

      <div className="mx-auto grid max-w-screen-lg gap-5 bg-inherit py-5 md:grid-cols-3 lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <div className="relative flex flex-col overflow-hidden rounded-xl border" key={plan.id}>
            <div className="min-h-[150px] items-start space-y-4 bg-blue-200 p-6">
              <p className="font-urban flex text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {plan.title}
              </p>
              <div className="flex flex-row">
                <div className="flex items-end">
                  <div className="flex text-left text-3xl font-semibold leading-6">
                    {plan.price}
                  </div>
                  <div className="-mb-1 ml-2 text-left text-sm font-medium">
                    <div>/{plan.frequency}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="flex h-full flex-col justify-between gap-16 p-6">
              <ul className="space-y-2 text-left text-sm font-medium leading-normal">
                {plan.features.map((feature, index) => (
                  <li className="flex items-start" key={index}>
                    <Icons.Check className="mr-3 h-5 w-5 shrink-0" />
                    <p>{feature}</p>
                  </li>
                ))}
                {plan.limitations.map((limitation, index) => (
                  <li className="flex items-start text-muted-foreground" key={index}>
                    <Icons.Close className="mr-3 h-5 w-5 shrink-0" />
                    <p>{limitation}</p>
                  </li>
                ))}
              </ul>

              {userId ? (
                plan.id === "starter" ? (
                  <Link
                    href="/dashboard"
                    
                  >
                     لوحة التحكم
                  </Link>
                ) : (
                 
                  <SubscriptionButton isPro={isPro} />
                )
              ) : (
            <Link href="/sign-up" passHref>
                <Button>التسجيل</Button>
              </Link>
              )}
            </div> */}
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-base text-muted-foreground">
        <Balancer>
          Email{" "}
          <a
            className="font-medium text-primary hover:underline"
            href="mailto:admin@arabicocr.net"
          >
            admin@arabicocr.net
          </a>{" "}
          for any inquiries or help.
          <br />
          <strong>We’re here to support you!</strong>
        </Balancer>
      </p>
    </section>
  );
}
