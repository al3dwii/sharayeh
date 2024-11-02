// apps/nextjs/src/components/price/pricing-cards.tsx

"use client";

import { ReactElement } from "react";
import Link from "next/link";
import Balancer from "react-wrap-balancer";
import { Button, buttonVariants } from "@/components/ui/button";
import * as Icons from "@/components/gadawel/icons";
import { SubscriptionButton } from "@/components/subscription-button";

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
    }
    
  ];

  return (
    <section className="container flex flex-col items-center text-center">
      <div className="mx-auto mb-10 flex w-full flex-col gap-5">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          الاشتراكات
        </p>
        <h2 className="font-heading text-3xl leading-[1.1] md:text-5xl">
اختر الباقة المناسبة
        </h2>
      </div>

      <div className="mx-auto grid max-w-screen-lg gap-5 bg-inherit py-5 md:grid-cols-2 lg:grid-cols-2">
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

            <div className="flex h-full flex-col justify-between gap-16 p-6">
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
                    className={buttonVariants({
                      className: "w-full button-blue-500",
                      variant: "default",
                    })}
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
            </div>
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


// // apps/nextjs/src/components/price/pricing-cards.tsx

// "use client";

// import { ReactElement } from "react";
// import Link from "next/link";
// import Balancer from "react-wrap-balancer";
// import { Button, buttonVariants } from "@/components/ui/button";
// import * as Icons from "@/components/gadawel/icons";
// import { useSigninModal } from "@/hooks/use-signin-modal";

// export function PricingCards({ userId }: { userId: string | null }) {
//   const signInModal = useSigninModal();

//   // Hard-coded pricing data
//   const pricingPlans = [
//     {
//       id: "starter",
//       title: "Starter Plan",
//       price: "$9.99",
//       frequency: "mo",
//       features: [
//         "10 document uploads per month",
//         "Basic OCR processing",
//         "Email support",
//       ],
//       limitations: ["No advanced analytics", "Limited storage"],
//     },
//     {
//       id: "pro",
//       title: "Pro Plan",
//       price: "$29.99",
//       frequency: "mo",
//       features: [
//         "Unlimited document uploads",
//         "Advanced OCR processing",
//         "Priority support",
//         "Access to analytics",
//       ],
//       limitations: [],
//     },
//   ];

//   return (
//     <section className="container flex flex-col items-center text-center">
//       <div className="mx-auto mb-10 flex w-full flex-col gap-5">
//         <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
//           Pricing
//         </p>
//         <h2 className="font-heading text-3xl leading-[1.1] md:text-5xl">
//           Choose the plan that fits you best
//         </h2>
//       </div>

//       <div className="mx-auto grid max-w-screen-lg gap-5 bg-inherit py-5 md:grid-cols-2 lg:grid-cols-2">
//         {pricingPlans.map((plan) => (
//           <div className="relative flex flex-col overflow-hidden rounded-xl border" key={plan.id}>
//             <div className="min-h-[150px] items-start space-y-4 bg-primary p-6">
//               <p className="font-urban flex text-sm font-bold uppercase tracking-wider text-muted-foreground">
//                 {plan.title}
//               </p>
//               <div className="flex flex-row">
//                 <div className="flex items-end">
//                   <div className="flex text-left text-3xl font-semibold leading-6">
//                     {plan.price}
//                   </div>
//                   <div className="-mb-1 ml-2 text-left text-sm font-medium">
//                     <div>/{plan.frequency}</div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             <div className="flex h-full flex-col justify-between gap-16 p-6">
//               <ul className="space-y-2 text-left text-sm font-medium leading-normal">
//                 {plan.features.map((feature, index) => (
//                   <li className="flex items-start" key={index}>
//                     <Icons.Check className="mr-3 h-5 w-5 shrink-0" />
//                     <p>{feature}</p>
//                   </li>
//                 ))}
//                 {plan.limitations.map((limitation, index) => (
//                   <li className="flex items-start text-muted-foreground" key={index}>
//                     <Icons.Close className="mr-3 h-5 w-5 shrink-0" />
//                     <p>{limitation}</p>
//                   </li>
//                 ))}
//               </ul>

//               {userId ? (
//                 plan.id === "starter" ? (
//                   <Link
//                     href="/dashboard"
//                     className={buttonVariants({
//                       className: "w-full button-primary",
//                       variant: "default",
//                     })}
//                   >
//                     Go to Dashboard
//                   </Link>
//                 ) : (
//                   <Button>Upgrade to {plan.title}</Button>
//                 )
//               ) : (
//                 <Button onClick={signInModal.onOpen}>Sign Up</Button>
//               )}
//             </div>
//           </div>
//         ))}
//       </div>

//       <p className="mt-3 text-center text-base text-muted-foreground">
//         <Balancer>
//           Email{" "}
//           <a
//             className="font-medium text-primary hover:underline"
//             href="mailto:admin@arabicocr.net"
//           >
//             admin@arabicocr.net
//           </a>{" "}
//           for any inquiries or help.
//           <br />
//           <strong>We’re here to support you!</strong>
//         </Balancer>
//       </p>
//     </section>
//   );
// }



// // apps/nextjs/src/components/price/pricing-cards.tsx

// "use client";

// import Link from "next/link";
// import Balancer from "react-wrap-balancer";
// import { Button, buttonVariants } from "@/components/ui/button";
// import * as Icons from "@/components/gadawel/icons";
// import { useSigninModal } from "@/hooks/use-signin-modal";



// export function PricingCards(
//   userId) {
//   const signInModal = useSigninModal();

//   return (
//     <section className="container flex flex-col items-center text-center">
//       <div className="mx-auto mb-10 flex w-full flex-col gap-5">
//         <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
//           Pricing
//         </p>
//         <h2 className="font-heading text-3xl leading-[1.1] md:text-5xl">
//           Choose the plan that fits you best
//         </h2>
//       </div>

//       <div className="mx-auto grid max-w-screen-lg gap-5 bg-inherit py-5 md:grid-cols-2 lg:grid-cols-2">
        
//             <div className="relative flex flex-col overflow-hidden rounded-xl border" key={offer.title as Key}>
//               <div className="min-h-[150px] items-start space-y-4 bg-primary p-6">
//                 <p className="font-urban flex text-sm font-bold uppercase tracking-wider text-muted-foreground">
//                   {offer.title}
//                 </p>

//                 <div className="flex flex-row">
//                   <div className="flex items-end">
//                     <div className="flex text-left text-3xl font-semibold leading-6">
//                       {/* Only show monthly price */}
//                       {`$${offer.prices.monthly}`}
//                     </div>
//                     <div className="-mb-1 ml-2 text-left text-sm font-medium">
//                       <div>/mo</div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex h-full flex-col justify-between gap-16 p-6">
//                 <ul className="space-y-2 text-left text-sm font-medium leading-normal">
                 
//                     <li className="flex items-start" key={feature}>
//                       <Icons.Check className="mr-3 h-5 w-5 shrink-0" />
//                       <p>{feature}</p>
//                     </li>
                  

//                   {offer.limitations?.length > 0 &&
                  
//                       <li className="flex items-start text-muted-foreground" key={feature}>
//                         <Icons.Close className="mr-3 h-5 w-5 shrink-0" />
//                         <p>{feature}</p>
//                       </li>
//                     ))}
//                 </ul>

              
//                   offer.id === "starter" ? (
//                     <Link
//                       href="/dashboard"
//                       className={buttonVariants({
//                         className: "w-full button-primary",
//                         variant: "default",
//                       })}
//                     >
//                       Go to Dashboard
//                     </Link>
//                   ) : (
//                     <Button  />
//                   )
//                 ) : (
//                   <Button onClick={signInModal.onOpen}>Sign Up</Button>
//                 )}
//               </div>
//             </div>
//           ))}
//       </div>

//       <p className="mt-3 text-center text-base text-muted-foreground">
//         <Balancer>
//           Email{" "}
//           <a
//             className="font-medium text-primary hover:underline"
//             href="mailto:support@saasfly.io"
//           >
//             admin@arabicocr.net
//           </a>{" "}
//           for any inquiries or help.
//           <br />
//           <strong>We’re here to support you!</strong>
//         </Balancer>
//       </p>
//     </section>
//   );
// }


// "use client";

// import { JSXElementConstructor, Key, ReactElement, ReactNode, useState } from "react";
// import Link from "next/link";
// import Balancer from "react-wrap-balancer";
// import { Button, buttonVariants } from "@/components/ui/button";
// import * as Icons from "@/components/gadawel/icons";
// import { BillingFormButton } from "@/components/gadawel/billing-form-button";
// import { priceDataMap } from "@/components/gadawel/price-data";
// import { useSigninModal } from "@/hooks/use-signin-modal";
// import { UserSubscriptionPlan } from "@/types";

// interface PricingCardsProps {
//   userId?: string;
//   subscriptionPlan?: UserSubscriptionPlan;
//   dict: Record<string, string>;
//   params: {
//     lang: string;
//   };
// }

// export function PricingCards({
//   userId,
//   subscriptionPlan,
//   dict,
//   params: { lang },
// }: PricingCardsProps) {
//   const signInModal = useSigninModal();
//   const pricingData = priceDataMap[lang];

//   return (
//     <section className="container flex flex-col items-center text-center ">
//       <div className="mx-auto mb-10 flex w-full flex-col gap-5">
//         <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
//           {dict.pricing}
//         </p>
//         <h2 className="font-heading text-3xl leading-[1.1] md:text-5xl">
//           {dict.slogan}
//         </h2>
//       </div>

//       <div className="mx-auto grid max-w-screen-lg gap-5 bg-inherit py-5 md:grid-cols-2 lg:grid-cols-2 ">
//         {pricingData
//           .filter((offer) => offer.id !== "business") // Remove the business plan
//           .map((offer: {
//             title:
//               | boolean
//               | Key
//               | ReactElement<any, string | JSXElementConstructor<any>>
//               | Iterable<ReactNode>
//               | null
//               | undefined;
//             prices: {
//               monthly:
//                 | string
//                 | number
//                 | boolean
//                 | ReactElement<any, string | JSXElementConstructor<any>>
//                 | Iterable<ReactNode>
//                 | null
//                 | undefined;
//             };
//             benefits: any[];
//             limitations: any[];
//             id: string;
//           }) => (
//             <div className="relative flex flex-col overflow-hidden rounded-xl border" key={offer?.title}>
//               <div className="min-h-[150px] items-start space-y-4 bg-primary p-6">
//                 <p className="font-urban flex text-sm font-bold uppercase tracking-wider text-muted-foreground">
//                   {offer?.title}
//                 </p>

//                 <div className="flex flex-row">
//                   <div className="flex items-end">
//                     <div className="flex text-left text-3xl font-semibold leading-6">
//                       {/* Only show monthly price */}
//                       {`$${offer?.prices?.monthly}`}
//                     </div>
//                     <div className="-mb-1 ml-2 text-left text-sm font-medium">
//                       <div>{dict.mo}</div>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="flex h-full flex-col justify-between gap-16 p-6">
//                 <ul className="space-y-2 text-left text-sm font-medium leading-normal">
//                   {offer?.benefits.map((feature) => (
//                     <li className="flex items-start" key={feature}>
//                       <Icons.Check className="mr-3 h-5 w-5 shrink-0" />
//                       <p>{feature}</p>
//                     </li>
//                   ))}

//                   {offer?.limitations?.length > 0 &&
//                     offer.limitations.map((feature) => (
//                       <li className="flex items-start text-muted-foreground" key={feature}>
//                         <Icons.Close className="mr-3 h-5 w-5 shrink-0" />
//                         <p>{feature}</p>
//                       </li>
//                     ))}
//                 </ul>

//                 {userId && subscriptionPlan ? (
//                   offer?.id === "starter" ? (
//                     <Link
//                       href="/dashboard"
//                       className={buttonVariants({
//                         className: "w-full button-primary",
//                         variant: "default",
//                       })}
//                     >
//                       {dict.go_to_dashboard}
//                     </Link>
//                   ) : (
//                     <BillingFormButton
//                       offer={offer}
//                       subscriptionPlan={subscriptionPlan}
//                       dict={dict}
//                     />
//                   )
//                 ) : (
//                   <Button onClick={signInModal.onOpen}>{dict.signup}</Button>
//                 )}
//               </div>
//             </div>
//           ))}
//       </div>

//       <p className="mt-3 text-center text-base text-muted-foreground">
//         <Balancer>
//           Email{" "}
//           <a
//             className="font-medium text-primary hover:underline"
//             href="mailto:support@saasfly.io"
//           >
//             admin@arabicocr.net
//           </a>{" "}
//           {dict.contact}
//           <br />
//           <strong>{dict.contact_2}</strong>
//         </Balancer>
//       </p>
//     </section>
//   );
// }


// import {
//   JSXElementConstructor,
//   Key,
//   PromiseLikeOfReactNode,
//   ReactElement,
//   ReactNode,
//   useState,
// } from "react";
// import Link from "next/link";
// import Balancer from "react-wrap-balancer";

// import { Button, buttonVariants } from "@saasfly/ui/button";
// import * as Icons from "@saasfly/ui/icons";
// import { Switch } from "@saasfly/ui/switch";

// import { BillingFormButton } from "~/components/price/billing-form-button";
// import { priceDataMap } from "~/config/price/price-data";
// import { useSigninModal } from "~/hooks/use-signin-modal";
// import { UserSubscriptionPlan } from "~/types";

// interface PricingCardsProps {
//   userId?: string;
//   subscriptionPlan?: UserSubscriptionPlan;
//   dict: Record<string, string>;
//   params: {
//     lang: string;
//   };
// }

// export function PricingCards({
//   userId,
//   subscriptionPlan,
//   dict,
//   params: { lang },
// }: PricingCardsProps) {
//   const isYearlyDefault = true;
//   const [isYearly, setIsYearly] = useState<boolean>(isYearlyDefault);
//   const signInModal = useSigninModal();
//   const pricingData = priceDataMap[lang];
//   const toggleBilling = () => {
//     setIsYearly(!isYearly);
//   };
//   return (
//     <section className="container flex flex-col items-center text-center">
//       <div className="mx-auto mb-10 flex w-full flex-col gap-5">
//         <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
//           {dict.pricing}
//         </p>
//         <h2 className="font-heading text-3xl leading-[1.1] md:text-5xl">
//           {dict.slogan}
//         </h2>
//       </div>

//       <div className="mb-4 flex items-center gap-5">
//         <span>{dict.monthly_bill}</span>
//         <Switch
//           checked={isYearly}
//           onCheckedChange={toggleBilling}
//           role="switch"
//           aria-label="switch-year"
//         />
//         <span>{dict.annual_bill}</span>
//       </div>

//       <div className="mx-auto grid max-w-screen-lg gap-5 bg-inherit py-5 md:grid-cols-3 lg:grid-cols-3">
//         {pricingData.map(
//           (offer: {
//             title:
//               | boolean
//               | Key
//               | ReactElement<any, string | JSXElementConstructor<any>>
//               | Iterable<ReactNode>
//               | PromiseLikeOfReactNode
//               | null
//               | undefined;
//             prices: {
//               monthly:
//                 | string
//                 | number
//                 | boolean
//                 | ReactElement<any, string | JSXElementConstructor<any>>
//                 | Iterable<ReactNode>
//                 | PromiseLikeOfReactNode
//                 | null
//                 | undefined;
//               yearly: number;
//             };
//             benefits: any[];
//             limitations: any[];
//             id: string;
//           }) => (
//             <div
//               className="relative flex flex-col overflow-hidden rounded-xl border"
//               key={offer?.title}
//             >
//               <div className="min-h-[150px] items-start space-y-4 bg-secondary/70 p-6">
//                 <p className="font-urban flex text-sm font-bold uppercase tracking-wider text-muted-foreground">
//                   {offer?.title}
//                 </p>

//                 <div className="flex flex-row">
//                   <div className="flex items-end">
//                     <div className="flex text-left text-3xl font-semibold leading-6">
//                       {isYearly && offer?.prices?.monthly > 0 ? (
//                         <>
//                           <span className="mr-2 text-muted-foreground line-through">
//                             ${offer?.prices?.monthly}
//                           </span>
//                           <span>${offer?.prices?.yearly / 12}</span>
//                         </>
//                       ) : (
//                         `$${offer?.prices?.monthly}`
//                       )}
//                     </div>
//                     <div className="-mb-1 ml-2 text-left text-sm font-medium">
//                       <div>{dict.mo}</div>
//                     </div>
//                   </div>
//                 </div>
//                 {offer.prices.monthly > 0 ? (
//                   <div className="text-left text-sm text-muted-foreground">
//                     {isYearly
//                       ? `$${offer?.prices?.yearly} ${dict.annual_info}`
//                       : `${dict.monthly_info}`}
//                   </div>
//                 ) : null}
//               </div>

//               <div className="flex h-full flex-col justify-between gap-16 p-6">
//                 <ul className="space-y-2 text-left text-sm font-medium leading-normal">
//                   {offer?.benefits.map((feature) => (
//                     <li className="flex items-start" key={feature}>
//                       <Icons.Check className="mr-3 h-5 w-5 shrink-0" />
//                       <p>{feature}</p>
//                     </li>
//                   ))}

//                   {offer?.limitations?.length > 0 &&
//                     offer.limitations.map((feature) => (
//                       <li
//                         className="flex items-start text-muted-foreground"
//                         key={feature}
//                       >
//                         <Icons.Close className="mr-3 h-5 w-5 shrink-0" />
//                         <p>{feature}</p>
//                       </li>
//                     ))}
//                 </ul>

//                 {userId && subscriptionPlan ? (
//                   offer?.id === "starter" ? (
//                     <Link
//                       href="/dashboard"
//                       className={buttonVariants({
//                         className: "w-full",
//                         variant: "default",
//                       })}
//                     >
//                       {dict.go_to_dashboard}
//                     </Link>
//                   ) : (
//                     <BillingFormButton
//                       year={isYearly}
//                       offer={offer}
//                       subscriptionPlan={subscriptionPlan}
//                       dict={dict}
//                     />
//                   )
//                 ) : (
//                   <Button onClick={signInModal.onOpen}>{dict.signup}</Button>
//                 )}
//               </div>
//             </div>
//           ),
//         )}
//       </div>

//       <p className="mt-3 text-center text-base text-muted-foreground">
//         <Balancer>
//           Email{" "}
//           <a
//             className="font-medium text-primary hover:underline"
//             href="mailto:support@saasfly.io"
//           >
//             support@saasfly.io
//           </a>{" "}
//           {dict.contact}
//           <br />
//           <strong>{dict.contact_2}</strong>
//         </Balancer>
//       </p>
//     </section>
//   );
// }
