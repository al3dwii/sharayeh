// src/components/landing/FaqAr.tsx
import type { ConverterRow } from "@/lib/tools";

export const FAQ_AR = (row: ConverterRow) => [
  {
    q: 'كيف يمكن تحويل ملف وورد إلى بوربوينت؟',
    a: 'اضغط زر رفع الملف، وسيتم تحويله تلقائياً إلى بوربوينت ثم يمكنك التنزيل.'
  },
  {
    q: 'هل يدعم الموقع اللغة العربية؟',
    a: 'نعم، الواجهة تدعم العربية مع تنسيق شرائح من اليمين إلى اليسار.'
  },
  {
    q: 'هل أحتاج لتنصيب برامج؟',
    a: 'كلا، يتم التحويل بالكامل داخل المتصفح دون أي برامج إضافية.'
  },
  {
    q: `ما هو الحد الأقصى لحجم الملف في ${row.label_ar}؟`,
    a: 'المستخدمون المجانيون حتى \u00A025\u00A0ميجابايت، و\u00A0500\u00A0ميجابايت لمشتركي برو.'
  },
  {
    q: 'هل يتغيّر تنسيق الشرائح؟',
    a: 'لا، نحافظ على الخطوط والصور والتخطيطات كما هي.'
  }
];

type Props = { row: ConverterRow };

export default function FaqAr({ row }: Props) {
  const faqs = FAQ_AR(row);

  return (
    <section dir="rtl" className="max-w-3xl mx-auto space-y-4">
      <h2 className="text-xl font-bold text-center">الأسئلة الشائعة</h2>
      {faqs.map(({ q, a }) => (
        <details key={q} className="p-4 border rounded">
          <summary className="font-medium cursor-pointer">{q}</summary>
          <p className="mt-2">{a}</p>
        </details>
      ))}
    </section>
  );
}

// // src/components/landing/FaqAr.tsx
// //-----------------------------------------------------
// // FINAL state after the 10-day sprint
// //-----------------------------------------------------
// "use client";

// import { ChevronDown } from "lucide-react";

// /**
//  * Arabic FAQ accordion.
//  * Uses semantic <details>/<summary> for native toggle
//  * and a small icon that rotates on open (via group-open utility).
//  */
// export const FAQ_AR: { q: string; a: string }[] = [
//   {
//     q: "كم حجم الملف المسموح؟",
//     a: "حتى 20 ميجابايت لكل ملف وورد. إذا كان ملفك أكبر، قسّمه أو ضغط الصور أولاً.",
//   },
//   {
//     q: "هل يعمل المحول على الجوال؟",
//     a: "نعم، يعمل مباشرة داخل المتصفح على iOS وAndroid دون الحاجة إلى تطبيق.",
//   },
//   {
//     q: "هل الخدمة مجانية؟",
//     a: "تحصل على 5 تحويلات مجانية يوميًا؛ بعد ذلك يمكنك شراء رصيد إضافي بأسعار رمزية.",
//   },
// ];

// export default function FaqAr() {
//   return (
//     <section
//       dir="rtl"
//       className="mx-auto max-w-2xl mt-16 space-y-4"
//       id="faq"
//     >
//       <h2 className="text-2xl font-semibold mb-4 text-center">
//         الأسئلة الشائعة
//       </h2>

//       {FAQ_AR.map(({ q, a }) => (
//         <details
//           key={q}
//           className="group border rounded-lg px-5 py-4 open:shadow-md open:bg-gray-50 transition-all"
//         >
//           <summary className="flex items-center justify-between cursor-pointer font-medium">
//             <span>{q}</span>
//             {/* Icon rotates 180° when details is open */}
//             <ChevronDown
//               className="size-5 transform transition-transform group-open:rotate-180"
//               aria-hidden
//             />
//           </summary>
//           <p className="mt-3 text-sm text-gray-700 leading-relaxed">{a}</p>
//         </details>
//       ))}
//     </section>
//   );
// }
