// src/components/landing/LandingCopyAr.tsx
//-----------------------------------------------------
// FINAL state after the 10-day sprint
//-----------------------------------------------------
"use client";

/**
 * Arabic body copy (~350 w) that lives under the uploader.
 * Contains LSI phrases and answers the three core objections:
 * speed, privacy, template-flexibility.
 *
 * NOTE:
 * - Headings <h2> & <p> are wrapped inside a `prose` container so
 *   typography inherits Tailwind @tailwindcss/typography defaults.
 * - `dir="rtl"` ensures punctuation & numbers render correctly.
 */
export default function LandingCopyAr() {
  return (
    <section
      dir="rtl"
      className="prose lg:prose-lg mx-auto mt-12 space-y-4 text-gray-800"
    >
      <h2>لماذا استخدام الذكاء الاصطناعي لتحويل وورد إلى بوربوينت؟</h2>
      <p>
        لأن محولنا <strong>محول وورد إلى بوربوينت</strong> المبني على
        الذكاء الاصطناعي يختصر ساعات من النسخ والتنسيق إلى ثوانٍ. كل ما
        عليك هو رفع ملف&nbsp;DOCX وسيعيد لك <em>PowerPoint</em> متناسقاً
        يَحترم بنية العناوين والقوائم والجداول. بفضل نموذج ‎Layout-LM
        المُدرَّب خصيصاً على مستندات الشركات العربية، تتحول الفقرات إلى
        شرائح مرتبة، والعناوين إلى عناوين شرائح تلقائياً.
      </p>

      <h2>هل بياناتي آمنة؟</h2>
      <p>
        تتم المعالجة داخل Google Cloud Storage باستخدام مفاتيح مشفّرة
        بخوارزمية&nbsp;KMS. يُحذف ملفك الأصلي وملف&nbsp;PPTX الناتج بعد&nbsp;24
        ساعة أو فور التنزيل — أيهما أقرب. لن نشارك مستنداتك مع أي طرف ثالث،
        ولن يدخل المحتوى في تدريب النموذج.
      </p>

      <h2>هل يمكنني اختيار قوالب مختلفة؟</h2>
      <p>
        نعم، يدعم المحول حالياً ثلاثة قوالب جاهزة:&nbsp;
        <strong>الأعمال</strong>، <strong>الأكاديمي</strong> و
        <strong>التقني</strong>. سنضيف المزيد بشكل دوري استناداً إلى
        اقتراحاتكم. بعد التحويل يمكنك تعديل الألوان أو الخطوط وإعادة
        التصدير بسهولة.
      </p>

      <p>
        جرّب الآن <strong>تحويل&nbsp;DOCX إلى&nbsp;PPTX</strong> عبر الضغط على
        الزر أعلاه وشاهد بنفسك السرعة والدقة التي يوفرها Sharayeh.
      </p>
    </section>
  );
}
