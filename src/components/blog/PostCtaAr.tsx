//-----------------------------------------------------
// Inline blog CTA component (Day 5)
//-----------------------------------------------------
"use client";

import Link from "next/link";

export default function PostCtaAr() {
  return (
    <section
      dir="rtl"
      className="my-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-emerald-500
                 p-6 text-white text-center shadow-lg"
    >
      <h3 className="text-xl font-semibold mb-2">جاهز لتحويل مستندك الآن؟</h3>
      <p className="mb-4">
        استخدم محول Sharayeh وحوّل ملف DOCX إلى PPTX في أقل من ٣٠ ثانية.
      </p>
      <Link
        href="/ar/تحويل-وورد-بوربوينت"
        className="inline-block rounded-xl bg-white/10 px-6 py-2 font-medium
                   hover:bg-white/20 transition"
      >
        جرّب المحول مجانًا
      </Link>
    </section>
  );
}
