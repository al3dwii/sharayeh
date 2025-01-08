// app/api/contact/route.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import axios from 'axios';
import { db } from '@/lib/db'; // Adjust the import path as necessary
import { z } from 'zod';

// Optional: Import rate limiter if implemented
// import { rateLimiter } from '@/lib/rateLimiter'; // Adjust the path accordingly

// Define the schema using Zod for validation
const contactFormSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب.'),
  email: z.string().email('عنوان البريد الإلكتروني غير صالح.'),
  phone: z
    .string()
    .min(10, 'رقم الهاتف يجب أن يكون على الأقل 10 أرقام.')
    .max(15, 'رقم الهاتف يجب ألا يزيد عن 15 رقمًا.'),
  message: z.string().min(1, 'الرسالة مطلوبة.'),
  recaptchaToken: z.string().min(1, 'رمز reCAPTCHA مطلوب.').optional(),
});

export async function POST(req: NextRequest) {
  try {
    // // Optional: Implement rate limiting
    // const rateLimitResponse = rateLimiter(req);
    // if (rateLimitResponse) {
    //   return rateLimitResponse;
    // }

    const body = await req.json();

    // Validate and sanitize input
    const parsedBody = contactFormSchema.safeParse(body);

    if (!parsedBody.success) {
      const errors = parsedBody.error.errors.map(err => err.message).join(', ');
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { name, email, phone, message, recaptchaToken } = parsedBody.data;

    // Determine if reCAPTCHA is enabled
    const isReCaptchaEnabled = process.env.NEXT_PUBLIC_ENABLE_RECAPTCHA === 'true';

    if (isReCaptchaEnabled) {
      // Verify reCAPTCHA
      const secretKey = process.env.RECAPTCHA_SECRET_KEY;
      if (!secretKey) {
        console.error('RECAPTCHA_SECRET_KEY is not defined.');
        return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
      }

      const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

      const recaptchaResponse = await axios.post(verifyURL);
      const { success, score } = recaptchaResponse.data;

      if (!success || score < 0.5) {
        return NextResponse.json({ error: 'فشل في التحقق من reCAPTCHA.' }, { status: 400 });
      }
    }

    // Verify that the message is in Arabic using regex
    const arabicRegex = /[\u0600-\u06FF]/;
    if (!arabicRegex.test(message)) {
      return NextResponse.json({ error: 'الرسالة يجب أن تكون باللغة العربية.' }, { status: 400 });
    }

    // Save the contact message to the database
    const contactMessage = await db.contactMessage.create({
      data: {
        name,
        email,
        phone,
        message,
      },
    });

    // Optional: Send confirmation email (implement as needed)

    // Optional: Log the contact message (for debugging)
    console.log('Contact Message Saved:', contactMessage);

    return NextResponse.json({ message: 'تم ارسال رسالتك بنجاح.' }, { status: 200 });
  } catch (error: any) {
    console.error('Contact API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
  }
}


// // app/api/contact/route.ts

// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import axios from 'axios';
// import { db } from '@/lib/db'; // Adjust the import path as necessary
// import { z } from 'zod';

// // Define the schema using Zod for validation
// const contactFormSchema = z.object({
//   name: z.string().min(1, 'Name is required'),
//   email: z.string().email('Invalid email address'),
//   message: z.string().min(1, 'Message is required'),
//   recaptchaToken: z.string().min(1, 'reCAPTCHA token is required').optional(),
// });

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();

//     // Validate and sanitize input
//     const parsedBody = contactFormSchema.safeParse(body);

//     if (!parsedBody.success) {
//       const errors = parsedBody.error.errors.map(err => err.message).join(', ');
//       return NextResponse.json({ error: errors }, { status: 400 });
//     }

//     const { name, email, message, recaptchaToken } = parsedBody.data;

//     // Determine if reCAPTCHA is enabled
//     const isReCaptchaEnabled = process.env.NEXT_PUBLIC_ENABLE_RECAPTCHA === 'true';

//     if (isReCaptchaEnabled) {
//       // Verify reCAPTCHA
//       const secretKey = process.env.RECAPTCHA_SECRET_KEY;
//       if (!secretKey) {
//         console.error('RECAPTCHA_SECRET_KEY is not defined.');
//         return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
//       }

//       const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${recaptchaToken}`;

//       const recaptchaResponse = await axios.post(verifyURL);
//       const { success, score } = recaptchaResponse.data;

//       if (!success || score < 0.5) {
//         return NextResponse.json({ error: 'reCAPTCHA verification failed.' }, { status: 400 });
//       }
//     }

//     // Save the contact message to the database
//     const contactMessage = await db.contactMessage.create({
//       data: {
//         name,
//         email,
//         message,
//       },
//     });

//     // Optional: Log the contact message (for debugging)
//     console.log('Contact Message Saved:', contactMessage);

//     return NextResponse.json({ message: 'Message sent successfully.' }, { status: 200 });
//   } catch (error: any) {
//     console.error('Contact API Error:', error);
//     return NextResponse.json({ error: 'Internal Server Error.' }, { status: 500 });
//   }
// }
