// components/landing/LandingCopyAr.tsx
import type { Converter as ConverterRow } from '@/lib/server/converters';
import { getArVariations } from '@/utils/variations';
import { dirReadable } from '@/utils/dirReadable';

type Props = { row: ConverterRow };

export default function LandingCopyAr({ row }: Props) {
  const variations = getArVariations(row.label_ar, row.dir);
  const dirText   = dirReadable(row.dir, 'ar');
  const extraIntro = row.intro_ar?.trim(); // optional

  return (
    <section dir="rtl" className="prose rtl:max-w-none mx-auto space-y-4">
      {/* generic intro (always) */}
      <p className="leading-relaxed">
        <strong>{row.label_ar}</strong> هي خدمة سحابية مدعومة بالذكاء الاصطناعي لتحويل&nbsp;
        {dirText} في ثوانٍ، مع الحفاظ التامّ على الخطوط، الصور، الجداول، والروابط
        كما هي في المستند الأصلي. تعمل الأداة مباشرة من المتصفّح على أي جهاز، وتقبل
        ملفات تصل إلى <span className="whitespace-nowrap">200&nbsp;م.ب</span>، مع تشفير كامل
        عبر <abbr title="HyperText Transfer Protocol Secure">HTTPS</abbr> وحذف تلقائي
        للملفات بعد ‎24&nbsp;ساعة. استمتع بقوالب عرض جاهزة، اقتراحات تصميم ذكية، ودعم كامل
        للّغة العربية واتجاه <span dir="rtl">RTL</span>—كل ذلك بدون الحاجة إلى تنزيل
        أي برامج مكتبيّة أو إضافات.
      </p>

      {/* optional extra intro (only if intro_ar exists) */}
      {extraIntro && (
        <p
          className="leading-relaxed"
          dangerouslySetInnerHTML={{ __html: extraIntro }}
        />
      )}

      {/* --------- خطوات الاستخدام --------- */}
      <h2>خطوات الاستخدام</h2>
      <table>
        <thead>
          <tr>
            <th>الخطوة</th>
            <th>الوصف</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td>التسجيل/تسجيل الدخول إلى حسابك.</td>
          </tr>
          <tr>
            <td>2</td>
            <td>رفع الملف عبر السحب-والإفلات أو زر «اختر ملف».</td>
          </tr>
          <tr>
            <td>3</td>
            <td>اختيار قالب جاهز أو تفعيل الاقتراح الذكي للتصميم.</td>
          </tr>
          <tr>
            <td>4</td>
            <td>تخصيص الشرائح (ألوان، خطوط، شعارات، رسوم بيانية).</td>
          </tr>
          <tr>
            <td>5</td>
            <td>تنزيل ملف PPTX أو مشاركته عبر رابط مباشر.</td>
          </tr>
        </tbody>
      </table>

      {/* --------- لماذا تختار --------- */}
      <h2>لماذا تختار أداة {row.label_ar}؟</h2>
      <ul>
        <li>⏱️ معالجة سريعة في ثوانٍ بدون برامج.</li>
        <li>🛡️ رفع آمن عبر HTTPS وحذف تلقائي للملفات.</li>
        <li>🤖 الذكاء الاصطناعي يحوّل النص إلى شرائح منظمة.</li>
        <li>🌐 دعم كامل للغة العربية واللغات الأخرى.</li>
      </ul>

      {/* --------- LSI variations --------- */}
      <p>
        ربما تبحث أيضاً عن:{' '}
        {variations.map((term, i) => (
          <span key={term}>
            {term}
            {i < variations.length - 1 && '، '}
          </span>
        ))}
      </p>
    </section>
  );
}

// // components/landing/LandingCopyAr.tsx
// import type { Converter as ConverterRow } from '@/lib/server/converters';
// import { getArVariations } from '@/utils/variations';
// import { dirReadable } from '@/utils/dirReadable';

// type Props = { row: ConverterRow };

// export default function LandingCopyAr({ row }: Props) {
//   const variations = getArVariations(row.label_ar, row.dir);
//   const dirText = dirReadable(row.dir, 'ar');

//   return (
//     <section dir="rtl" className="prose rtl:max-w-none mx-auto space-y-4">
//       <p className="leading-relaxed">
//       <strong>{row.label_ar}</strong> هي خدمة سحابية مدعومة بالذكاء الاصطناعي لتحويل&nbsp;
//       {dirText} في ثوانٍ، مع الحفاظ التامّ على الخطوط، الصور، الجداول، والروابط
//       كما هي في المستند الأصلي. تعمل الأداة مباشرة من المتصفّح على أي جهاز، وتقبل
//       ملفات تصل إلى <span className="whitespace-nowrap">200 م.ب</span>، مع تشفير كامل
//       عبر <abbr title="HyperText Transfer Protocol Secure">HTTPS</abbr> وحذف تلقائي
//       للملفات بعد ‎24 ساعة. استمتع بقوالب عرض جاهزة، اقتراحات تصميم ذكية، ودعم كامل
//       للّغة العربية واتجاه <span dir="rtl">RTL</span>—كل ذلك بدون الحاجة إلى تنزيل
//       أي برامج مكتبيّة أو إضافات.
//     </p>


//       <h2>خطوات الاستخدام</h2>
//       <table>
//         <thead>
//           <tr>
//             <th>الخطوة</th>
//             <th>الوصف</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr>
//             <td>1</td>
//             <td>التسجيل/تسجيل الدخول إلى حسابك.</td>
//           </tr>
//           <tr>
//             <td>2</td>
//             <td>رفع الملف عبر السحب-والإفلات أو زر «اختر ملف».</td>
//           </tr>
//           <tr>
//             <td>3</td>
//             <td>اختيار قالب جاهز أو تفعيل الاقتراح الذكي للتصميم.</td>
//           </tr>
//           <tr>
//             <td>4</td>
//             <td>تخصيص الشرائح (ألوان، خطوط، شعارات، رسوم بيانية).</td>
//           </tr>
//           <tr>
//             <td>5</td>
//             <td>تنزيل ملف PPTX أو مشاركته عبر رابط مباشر.</td>
//           </tr>
//         </tbody>
//       </table>

//       <h2>لماذا تختار أداة {row.label_ar}؟</h2>
//       <ul>
//         <li>⏱️ معالجة سريعة في ثوانٍ بدون برامج.</li>
//         <li>🛡️ رفع آمن عبر HTTPS وحذف تلقائي للملفات.</li>
//         <li>🤖 الذكاء الاصطناعي يحوّل النص إلى شرائح منظمة.</li>
//         <li>🌐 دعم كامل للغة العربية واللغات الأخرى.</li>
//       </ul>

//       <p>
//         ربما تبحث أيضاً عن:{' '}
//         {variations.map((term, i) => (
//           <span key={term}>
//             {term}
//             {i < variations.length - 1 && '، '}
//           </span>
//         ))}
//       </p>
//     </section>
//   );
// }

// // components/landing/LandingCopyAr.tsx
// import { getArVariations } from '@/utils/variations';
// import type { Converter as ConverterRow } from '@/lib/types';  // ✅ safe in client

// type Props = { row: ConverterRow };

// export default function LandingCopyAr({ row }: Props) {
//   const dirReadable = row.dir.replace('→', ' إلى ');
//   const variations   = getArVariations(row.label_ar, row.dir);

//   return (
//     <section dir="rtl" className="prose rtl:max-w-none mx-auto space-y-4">
//       <p>
//         <strong>{row.label_ar}</strong> هي أسرع خدمة عبر الإنترنت لتحويل&nbsp;
//         {dirReadable}. احتفظ بجميع الخطوط والصور والتنسيقات الأصلية بدون الحاجة
//         إلى أي برامج مكتبية.
//       </p>

//       <h2>لماذا تختار أداة {row.label_ar}؟</h2>
//              <ul>
//          <li>⏱️ معالجة سريعة في ثوانٍ بدون برامج</li>
//          <li>🛡️ رفع آمن عبر HTTPS وحذف الملفات تلقائياً</li>
//          <li>🤖 الذكاء الاصطناعي يحول النص إلى شرائح منظمة</li>
//          <li>🌐 دعم كامل للغة العربية واللغات الأخرى</li>
//        </ul>
    
//       {/* Related search terms embedded as natural text or a tag list */}
//       <p>
//         ربما تبحث أيضاً عن:{" "}
//         {variations.map((term, i) => (
//           <span key={term}>
//             {term}
//             {i < variations.length - 1 && "، "}
//           </span>
//         ))}
//       </p>
//     </section>
//   );
// }


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
