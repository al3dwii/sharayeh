// src/components/pricing/PricingSection.tsx
'use client'

import React, { useState } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import Balancer from "react-wrap-balancer";

import { toast } from 'sonner';
import Loading from '@/components/global/loading';
import PlanCard from './PlanCard';
import { pricingPlans } from './planConfig';

interface PricingSectionProps {
  currentPlanId: string | null;
}

const PricingSection: React.FC<PricingSectionProps> = ({ currentPlanId }) => {
  const { isSignedIn } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleBuyPackage = async (packageId: string) => {
    if (!isSignedIn) {
      toast.info('Please sign in to purchase packages.');
      router.push('/sign-in');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/buy-package', {
        packageId,
      });
      // Redirect to Stripe Checkout
      window.location.href = response.data.url;
    } catch (error: any) {
      console.error('Purchase error:', error);
      const message =
        error.response?.data?.error || 'Failed to purchase package. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="container mt-8 flex flex-col items-center text-center">
      <div className="mx-auto mt-10 flex w-full flex-col gap-5">
        <p className="font-tajawal text-4xl font-bold text-black">الباقات</p>
        <h2 className="font-tajawal font-heading text-sm leading-[1.1] md:text-xl text-blue-500">
          الشراء مرة واحدة ولا يتم التجديد تلقائياً
        </h2>
      </div>
      {loading && <Loading />}
      <div className="mx-auto grid max-w-screen-lg gap-5 py-5 md:grid-cols-2 lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            onBuy={handleBuyPackage}
            currentPlanId={currentPlanId}
          />
        ))}
      </div>

      <p className="mt-3 text-center text-base text-muted-foreground">
        راسلنا لاي استفسار
        <br />
        <strong>جاهزين للرد والدعم</strong>
        <br />
        <Balancer>
          البريد الالكتروني{" "}
          <br/>
          <a
            className="font-medium text-primary hover:underline"
            href="mailto:admin@arabicocr.net"
          >
            sibawayhLLC@outlook.com
          </a>{" "}
        </Balancer>
      </p>
      {/* الواتساب {" "}
      <br/>
      <p className="mb-3 text-left text-base text-muted-foreground">
        0096561007772
      </p> */}
    </section>
  );
};

export default PricingSection;


// // src/components/pricing/PricingSection.tsx
// 'use client'

// import React, { useState } from 'react';
// import axios from 'axios';
// import { useUser } from '@clerk/nextjs';
// import { useRouter } from 'next/navigation';
// import Balancer from "react-wrap-balancer";

// import { toast } from 'sonner';
// import Loading from '@/components/global/loading';
// import PlanCard from './PlanCard';
// import { pricingPlans } from '@/config/planConfig';

// interface PricingSectionProps {
//   currentPlanId: string | null;
// }

// const PricingSection: React.FC<PricingSectionProps> = ({ currentPlanId }) => {
//   const { isSignedIn, user } = useUser();
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);

//   const handleBuyPackage = async (packageId: string) => {
//     if (!isSignedIn) {
//       toast.info('Please sign in to purchase packages.');
//       router.push('/sign-in');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post('/api/buy-package', {
//         packageId,
//       });
//       // Redirect to Stripe Checkout
//       window.location.href = response.data.url;
//     } catch (error: any) {
//       console.error('Purchase error:', error);
//       const message =
//         error.response?.data?.error || 'Failed to purchase package. Please try again.';
//       toast.error(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section className="container mt-8 flex flex-col items-center text-center">
//       <div className="mx-auto mt-10 flex w-full flex-col gap-5">
//         <p className="font-tajawal text-4xl font-bold text-black">الباقات</p>
//         <h2 className="font-tajawal font-heading text-sm leading-[1.1] md:text-xl text-blue-500">
//           الشراء مرة واحدة ولا يتم التجديد تلقائياً
//         </h2>
//       </div>
//       {loading && <Loading />}
//       <div className="mx-auto grid max-w-screen-lg gap-5 py-5 md:grid-cols-2 lg:grid-cols-3">
//         {pricingPlans.map((plan) => (
//           <PlanCard
//             key={plan.id}
//             plan={plan}
//             onBuy={handleBuyPackage}
//             currentPlanId={currentPlanId}
//           />
//         ))}
//       </div>

      

//       <p className="mt-3 text-center text-base text-muted-foreground">
//       راسلنا لاي استفسار
//           <br />
//           <strong>جاهزين للرد والدعم</strong>
//           <br />
//         {/* Your existing footer content */}
//         <Balancer>
//           البريد الالكتروني{" "}
//           <br/>
//           <a
//             className="font-medium text-primary hover:underline"
//             href="mailto:admin@arabicocr.net"
//           >
//             cont@sharayeh.com
//           </a>{" "}
        
//         </Balancer>
//       </p>
//       الواتساب {" "}
//       <br/>
//       <p className="mb-3 text-left text-base text-muted-foreground">
//        0096561007772
//       </p>

   
//     </section>
//   );
// };

// export default PricingSection;



// // src/components/pricing/PricingSection.tsx
// 'use client';

// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { useUser } from '@clerk/nextjs';
// import { useRouter } from 'next/navigation';
// import Balancer from 'react-wrap-balancer';

// import { toast } from 'sonner';
// import Loading from '@/components/global/loading';
// import PlanCard from './PlanCard';
// import { pricingPlans } from '@/config/planConfig';

// interface PricingSectionProps {
//   currentPlanId: string | null;
// }

// const PricingSection: React.FC<PricingSectionProps> = ({ currentPlanId }) => {
//   const { isSignedIn } = useUser();
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);

//   // Contact Form State
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     phone: '',
//     message: '',
//     honeypot: '',
//     recaptchaToken: '',
//   });
//   const [formLoading, setFormLoading] = useState(false);

//   // Determine if reCAPTCHA is enabled based on environment variable
//   const isReCaptchaEnabled = process.env.NEXT_PUBLIC_ENABLE_RECAPTCHA === 'true';

//   const handleBuyPackage = async (packageId: string) => {
//     if (!isSignedIn) {
//       toast.info('Please sign in to purchase packages.');
//       router.push('/sign-in');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post('/api/buy-package', {
//         packageId,
//       });
//       // Redirect to Stripe Checkout
//       window.location.href = response.data.url;
//     } catch (error: any) {
//       console.error('Purchase error:', error);
//       const message =
//         error.response?.data?.error || 'Failed to purchase package. Please try again.';
//       toast.error(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle Contact Form Submission
//   const handleFormSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Check Honeypot Field
//     if (formData.honeypot) {
//       // Bot detected
//       return;
//     }

//     // Validate that the message is in Arabic
//     const arabicRegex = /[\u0600-\u06FF]/;
//     if (!arabicRegex.test(formData.message)) {
//       toast.error('يرجى كتابة رسالتك باللغة العربية.');
//       return;
//     }

//     setFormLoading(true);
//     try {
//       const payload: any = {
//         name: formData.name,
//         email: formData.email,
//         phone: formData.phone,
//         message: formData.message,
//       };

//       if (isReCaptchaEnabled) {
//         payload.recaptchaToken = formData.recaptchaToken;
//       }

//       const response = await axios.post('/api/contact', payload);

//       if (response.status === 200) {
//         toast.success('تم ارسال رسالتك بنجاح.');
//         setFormData({
//           name: '',
//           email: '',
//           phone: '',
//           message: '',
//           honeypot: '',
//           recaptchaToken: '',
//         });
//       }
//     } catch (error: any) {
//       console.error('Contact form error:', error);
//       const message =
//         error.response?.data?.error || 'فشل في ارسال الرسالة. يرجى المحاولة مرة أخرى.';
//       toast.error(message);
//     } finally {
//       setFormLoading(false);
//     }
//   };

//   // Handle reCAPTCHA Callback
//   const handleRecaptcha = (token: string | null) => {
//     setFormData((prev) => ({ ...prev, recaptchaToken: token || '' }));
//   };

//   // Dynamically load reCAPTCHA script if enabled
//   useEffect(() => {
//     if (isReCaptchaEnabled) {
//       const script = document.createElement('script');
//       script.src = 'https://www.google.com/recaptcha/api.js';
//       script.async = true;
//       script.defer = true;
//       document.body.appendChild(script);

//       return () => {
//         document.body.removeChild(script);
//       };
//     }
//   }, [isReCaptchaEnabled]);

//   return (
//     <section className="container mt-8 flex flex-col items-center text-center">
//       <div className="mx-auto mt-10 flex w-full flex-col gap-5">
//         <p className="font-tajawal text-4xl font-bold text-black">الباقات</p>
//         <h2 className="font-tajawal font-heading text-sm leading-[1.1] md:text-xl text-blue-500">
//           الشراء مرة واحدة ولا يتم التجديد تلقائياً
//         </h2>
//       </div>

//       <div className="mx-auto grid max-w-screen-lg gap-5 py-5 md:grid-cols-2 lg:grid-cols-3">
//         {pricingPlans.map((plan) => (
//           <PlanCard
//             key={plan.id}
//             plan={plan}
//             onBuy={handleBuyPackage}
//             currentPlanId={currentPlanId}
//           />
//         ))}
//       </div>

//       {/* Contact Form Section */}
//       <div className="w-full max-w-md mt-8 p-6 bg-gray-100 rounded-lg shadow-md">
//         <h3 className="text-2xl font-bold mb-4">راسلنا لأي استفسار</h3>
//         <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
//           <label htmlFor="name" className="text-right">
//             الاسم:
//             <input
//               type="text"
//               id="name"
//               name="name"
//               className="w-full p-2 border border-gray-300 rounded mt-1"
//               required
//               value={formData.name}
//               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//             />
//           </label>

//           <label htmlFor="email" className="text-right">
//             البريد الالكتروني:
//             <input
//               type="email"
//               id="email"
//               name="email"
//               className="w-full p-2 border border-gray-300 rounded mt-1"
//               required
//               value={formData.email}
//               onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//             />
//           </label>

//           <label htmlFor="phone" className="text-right">
//             رقم الهاتف:
//             <input
//               type="tel"
//               id="phone"
//               name="phone"
//               // pattern="^\+?\d{10,15}$"
//               className="w-full p-2 border border-gray-300 rounded mt-1"
//               required
//               placeholder="+96500000007"
//               value={formData.phone}
//               onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
//             />
//             <small className="text-xs text-gray-500">مثال: 96500000007</small>
//           </label>

//           <label htmlFor="message" className="text-right">
//             رسالتك:
//             <textarea
//               id="message"
//               name="message"
//               className="w-full p-2 border border-gray-300 rounded mt-1"
//               required
//               rows={4}
//               value={formData.message}
//               onChange={(e) => setFormData({ ...formData, message: e.target.value })}
//             ></textarea>
//           </label>

//           {/* Honeypot Field */}
//           <div className="hidden">
//             <label htmlFor="honeypot">لا تملأ هذا الحقل:</label>
//             <input
//               type="text"
//               id="honeypot"
//               name="honeypot"
//               value={formData.honeypot}
//               onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
//               autoComplete="off"
//             />
//           </div>

//           {/* Google reCAPTCHA */}
//           {isReCaptchaEnabled && (
//             <div
//               className="g-recaptcha"
//               data-sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
//               data-callback="onRecaptchaChange"
//             ></div>
//           )}

//           <button
//             type="submit"
//             className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
//             disabled={formLoading || (isReCaptchaEnabled && !formData.recaptchaToken)}
//           >
//             {formLoading ? 'جار الإرسال...' : 'ارسال'}
//           </button>
//         </form>
//       </div>

//       {/* Optional: Obfuscated Email Address */}
//       <p className="mt-6 text-center text-base text-muted-foreground">
//         <Balancer>
//           البريد الالكتروني <span id="obfuscated-email" className="font-medium text-primary"></span>
//           <br />
//           <strong>جاهزين للرد والدعم</strong>
//         </Balancer>
//       </p>

//       {loading && <Loading />}

//       {/* JavaScript for Email Obfuscation and reCAPTCHA Callback */}
//       <script
//         dangerouslySetInnerHTML={{
//           __html: `
//             (function() {
//               // Email Obfuscation
//               var user = "admin";
//               var domain = "sharayeh.com";
//               var email = user + "@" + domain;
//               var link = document.createElement("a");
//               link.href = "mailto:" + email;
//               link.textContent = email;
//               document.getElementById("obfuscated-email").appendChild(link);
              
//               // reCAPTCHA Callback
//               window.onRecaptchaChange = function(token) {
//                 const recaptchaTokenInput = document.querySelector('input[name="recaptchaToken"]');
//                 if (recaptchaTokenInput) {
//                   recaptchaTokenInput.value = token;
//                 }
//               };
//             })();
//           `,
//         }}
//       ></script>
//     </section>
//   );
// };

// export default PricingSection;



// // src/components/pricing/PricingSection.tsx

// "use client";

// import { useState, useEffect } from "react";
// import Balancer from "react-wrap-balancer";
// import { useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";
// import axios from "axios";
// import { toast } from "sonner";
// import PlanCard from "./PlanCard";
// import Loading from '@/components/global/loading';

// import { pricingPlans, Plan } from "@/config/planConfig";

// interface PricingSectionProps {
//   currentPlanId: string | null;
// }

// const PricingSection: React.FC<PricingSectionProps> = ({ currentPlanId }) => {
//   const { isSignedIn, user } = useUser();
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [currentUserId, setCurrentUserId] = useState<string | null>(null);

//   useEffect(() => {
//     if (user) {
//       setCurrentUserId(user.id);
//     } else {
//       setCurrentUserId(null);
//     }
//   }, [user]);

//   const handleBuy = async (packageId: string) => { // Renamed to handleBuy
//     if (!isSignedIn) {
//       toast.info("Please sign in to purchase packages.");
//       router.push("/sign-in");
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post("/api/buy-package", { // Updated API endpoint
//         packageId, // Send packageId
//       });
//       // Assuming the API returns a URL to redirect the user for payment
//       window.location.href = response.data.url;
//     } catch (error: any) {
//       console.error("Purchase error:", error);
//       const message =
//         error.response?.data?.error || "Failed to purchase package. Please try again.";
//       toast.error(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section className="container mt-8 flex flex-col items-center text-center">
//       <div className="mx-auto mt-10 flex w-full flex-col gap-5">
//         <p className="font-tajawal text-4xl font-bold text-black">
//           الباقات
//         </p>
//         <h2 className="font-tajawal font-heading text-sm leading-[1.1] md:text-xl text-blue-500">
//           الشراء مرة واحدة ولا يتم التجديد تلقائياً   
//         </h2>
//       </div>

//       <div className="mx-auto grid max-w-screen-lg gap-5 py-5 md:grid-cols-2 lg:grid-cols-3">
//         {pricingPlans.map((plan: Plan) => (
//           <PlanCard
//             key={plan.id}
//             plan={plan}
//             onBuy={handleBuy} // Pass the handleBuy function
//             currentPlanId={currentPlanId}
//           />
//         ))}
//       </div>

//       <p className="mt-3 text-center text-base text-muted-foreground">
//         <Balancer>
//           البريد الالكتروني{" "}
//           <a
//             className="font-medium text-primary hover:underline"
//             href="mailto:admin@arabicocr.net"
//           >
//             admin@sharayeh.com
//           </a>{" "}
//           <br />
//           راسلنا لاي استفسار
//           <br />
//           <strong>جاهزين للرد والدعم</strong>
//         </Balancer>
//       </p>

//       {loading && <Loading />}
//     </section>
//   );
// };

// export default PricingSection;


// // src/components/pricing/PricingSection.tsx

// "use client";

// import { useState, useEffect } from "react";
// import Balancer from "react-wrap-balancer";
// import { useUser } from "@clerk/nextjs";
// import { useRouter } from "next/navigation";
// import axios from "axios";
// import { toast } from "sonner";
// import PlanCard from "./PlanCard";
// import Loading from '@/components/global/loading';

// import { planHierarchy, pricingPlans, Plan } from "@/config/planConfig";

// interface PricingSectionProps {
//   currentPlanId: string | null;
// }

// const PricingSection: React.FC<PricingSectionProps> = ({ currentPlanId }) => {
//   const { isSignedIn, user } = useUser();
//   const router = useRouter();
//   const [loading, setLoading] = useState(false);
//   const [currentUserId, setCurrentUserId] = useState<string | null>(null);

//   useEffect(() => {
//     if (user) {
//       setCurrentUserId(user.id);
//     } else {
//       setCurrentUserId(null);
//     }
//   }, [user]);

//   const handleSubscribe = async (packageId: string) => { // Renamed parameter to packageId
//     if (!isSignedIn) {
//       toast.info("Please sign in to subscribe.");
//       router.push("/sign-in");
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post("/api/create-subscription", {
//         packageId, // Send packageId instead of planId
//       });
//       window.location.href = response.data.url;
//     } catch (error: any) {
//       console.error("Subscription error:", error);
//       const message =
//         error.response?.data?.error || "Failed to create subscription. Please try again.";
//       toast.error(message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <section className="container mt-8 flex flex-col items-center text-center">
//       <div className="mx-auto mt-10 flex w-full flex-col gap-5">
//         <p className="font-tajawal text-4xl font-bold text-black">
//           الباقات
//         </p>
//         <h2 className="font-tajawal font-heading text-sm leading-[1.1] md:text-xl text-blue-500">
//          الشراء مرة واحدة ولا يتم التجديد تلقائياً   
//               </h2>
//       </div>

//       <div className="mx-auto grid max-w-screen-lg gap-5 py-5 md:grid-cols-2 lg:grid-cols-3">
//         {pricingPlans.map((plan: Plan) => (
//           <PlanCard
//             key={plan.id}
//             plan={plan}
//             onSubscribe={handleSubscribe}
//             currentPlanId={currentPlanId}
//             planHierarchy={planHierarchy}
//           />
//         ))}
//       </div>

//       <p className="mt-3 text-center text-base text-muted-foreground">
//         <Balancer>
//           البريد الالكتروني{" "}
//           <a
//             className="font-medium text-primary hover:underline"
//             href="mailto:admin@arabicocr.net"
//           >
//             admin@sharayeh.com
//           </a>{" "}
//           <br />
//           راسلنا لاي استفسار
//           <br />
//           <strong>جاهزين للرد والدعم</strong>
//         </Balancer>
//       </p>

//       {loading && <Loading />}
//     </section>
//   );
// };

// export default PricingSection;

