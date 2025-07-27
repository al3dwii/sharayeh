// components/landing/LandingCopyAr.tsx
import { getArVariations } from '@/utils/variations';
import type { Converter as ConverterRow } from '@/lib/types';  // ✅ safe in client

type Props = { row: ConverterRow };

export default function LandingCopyAr({ row }: Props) {
  const dirReadable = row.dir.replace('→', ' إلى ');
  const variations   = getArVariations(row.label_ar, row.dir);

  return (
    <section dir="rtl" className="prose rtl:max-w-none mx-auto space-y-4">
      <p>
        <strong>{row.label_ar}</strong> هي أسرع خدمة عبر الإنترنت لتحويل&nbsp;
        {dirReadable}. احتفظ بجميع الخطوط والصور والتنسيقات الأصلية بدون الحاجة
        إلى أي برامج مكتبية.
      </p>

      <h2>لماذا تختار أداة {row.label_ar}؟</h2>
      <ul>
        <li>⏱️ معالجة سحابية فورية – لا حاجة للتنصيب</li>
        <li>️ رفع آمن عبر HTTPS وحذف تلقائي بعد ساعتين</li>
        <li> دقة عالية في كل شريحة</li>
        <li> وضع التحويل الجماعي للمستخدمين المحترفين</li>
      </ul>

      {/* Related search terms embedded as natural text or a tag list */}
      <p>
        ربما تبحث أيضاً عن:{" "}
        {variations.map((term, i) => (
          <span key={term}>
            {term}
            {i < variations.length - 1 && "، "}
          </span>
        ))}
      </p>
    </section>
  );
}

// // src/components/landing/LandingCopyAr.tsx
// import type { ConverterRow } from "@/lib/tools";

// type Props = { row: ConverterRow };

// export default function LandingCopyAr({ row }: Props) {
//   // "DOCX→PPT"  →  "DOCX إلى PPT"
//   const dirReadable = row.dir.replace("→", " إلى ");

//   return (
//     <section dir="rtl" className="prose rtl:max-w-none mx-auto space-y-4">
//       <p>
//         <strong>تحويل ملف وورد إلى بوربوينت</strong> هي خدمة سحابية سريعة تمكنك من تحويل مستندات DOCX إلى عرض شرائح PowerPoint بنقرة واحدة.
//         احتفظ بالصور والخطوط والتنسيق الأصلي – وكل ذلك من متصفحك.
//       </p>

//       <h2>لماذا تختار أداة {row.label_ar}؟</h2>
//       <ul>
//         <li>⏱️ معالجة سريعة في ثوانٍ بدون برامج</li>
//         <li>🛡️ رفع آمن عبر HTTPS وحذف الملفات تلقائياً</li>
//         <li>🤖 الذكاء الاصطناعي يحول النص إلى شرائح منظمة</li>
//         <li>🌐 دعم كامل للغة العربية واللغات الأخرى</li>
//       </ul>

//       <p>
//         هل ترغب في أتمتة {dirReadable}? اطلع على
//         <a href="/ar/developer-enterprise">‏واجهة البرمجة لدينا</a>.
//       </p>
//     </section>
//   );
// }
