// src/components/seo/StructuredDataAr.tsx
//-----------------------------------------------------
// FINAL state after the 10-day sprint
//-----------------------------------------------------
/* eslint-disable @next/next/no-img-element */
import { appVersion } from "@/lib/packageInfo";

/**
 * Injects SoftwareApplication + HowTo JSON-LD for the Arabic
 * landing page.  Because the page is statically generated
 * (`dynamic = "error"`), these <script> tags are emitted in
 * the prerendered HTML that Googlebot fetches.
 *
 * Only consumed on the Arabic route, so copy is hard-coded in AR.
 */
export default function StructuredDataAr() {
  /* ----------- SoftwareApplication ----------- */
  const software = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Sharayeh Word → PowerPoint Converter",
    operatingSystem: "Web",
    applicationCategory: "BusinessApplication",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD"
    },
    softwareVersion: appVersion,
    screenshot: "https://sharayeh.com/og-cover.png"
  };

  /* --------------- HowTo steps --------------- */
  const howTo = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "كيفية تحويل ملف وورد إلى بوربوينت",
    totalTime: "PT30S",
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "ارفع ملف DOCX",
        text: "اسحب مستند Word أو اختره من جهازك."
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "اختر القالب",
        text: "حدد قالب الأعمال أو الأكاديمي أو التقني."
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "حمِّل العرض الناتج",
        text: "انقر زر «تنزيل» لتحصل على ملف PPTX."
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(software) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howTo) }}
      />
    </>
  );
}
