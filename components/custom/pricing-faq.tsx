// apps/nextjs/src/components/price/pricing-faq.tsx

// apps/nextjs/src/components/price/pricing-faq.tsx
import Balancer from "react-wrap-balancer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { priceFaqDataMap } from "@/components/custom/price-faq-data";

export function PricingFaq() {
  // Assuming you default to English or fetch a specific language outside this component
  const pricingFaqData = priceFaqDataMap["en"]; // Replace "en" as needed

  return (
    <section className="container max-w-3xl py-2">
      <div className="mb-14 space-y-6 text-center">
        <h1 className="font-heading text-center text-3xl md:text-5xl">
          <Balancer>اجابات الأسئلة المتكررة</Balancer>
        </h1>
        <p className="text-md text-muted-foreground">
          <Balancer>تفاصيل عن الخدمات والاشتراك</Balancer>
        </p>
      </div>
      <Accordion type="single" collapsible className="w-full">
        {pricingFaqData?.map((faqItem) => (
          <AccordionItem key={faqItem.id} value={faqItem.id}>
            <AccordionTrigger>{faqItem.question}</AccordionTrigger>
            <AccordionContent>{faqItem.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}



// import Balancer from "react-wrap-balancer";

// import {
//   Accordion,
//   AccordionContent,
//   AccordionItem,
//   AccordionTrigger,
// } from "@/components/ui/accordion";

// import { priceFaqDataMap } from "@/components/gadawel/price-faq-data";

// export function PricingFaq({
//   params: { lang },
//   dict,
// }: {
//   params: {
//     lang: Locale;
//   };
//   dict: Record<string, string>;
// }) {
//   const pricingFaqData = priceFaqDataMap[lang];
//   return (
//     <section className="container max-w-3xl py-2">
//       <div className="mb-14 space-y-6 text-center">
//         <h1 className="font-heading text-center text-3xl md:text-5xl">
//           <Balancer>{dict.faq}</Balancer>
//         </h1>
//         <p className="text-md text-muted-foreground">
//           <Balancer>{dict.faq_detail}</Balancer>
//         </p>
//       </div>
//       <Accordion type="single" collapsible className="w-full">
//         {pricingFaqData?.map((faqItem) => (
//           <AccordionItem key={faqItem.id} value={faqItem.id}>
//             <AccordionTrigger>{faqItem.question}</AccordionTrigger>
//             <AccordionContent>{faqItem.answer}</AccordionContent>
//           </AccordionItem>
//         ))}
//       </Accordion>
//     </section>
//   );
// }
