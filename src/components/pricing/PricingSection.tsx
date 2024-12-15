

// /src/components/Pricing/PricingSection.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Balancer from "react-wrap-balancer";
import Button from "@/components/UI/Button2";
import * as Icons from "@/components/UI/Icons";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import PlanCard from "./PlanCard";
import Loading from '@/components/global/loading';

interface PricingSectionProps {
  isPro: boolean;
}

const PricingSection: React.FC<PricingSectionProps> = ({ isPro }) => {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setCurrentUserId(user.id);
    } else {
      setCurrentUserId(null);
    }
  }, [user]);

  // Define pricing plans
  const pricingPlans = [
    {
      id: "starter",
      title: "الخطة الأساسية",
      price: "9.99$",
      frequency: "شهرياً",
      features: [
        "رفع 10 مستندات شهرياً",
        "معالجة OCR الأساسية",
        "دعم عبر البريد الإلكتروني",
      ],
      limitations: [
        "لا توجد تحليلات متقدمة",
        "سعة تخزين محدودة",
      ],
    },
    {
      id: "pro",
      title: "خطة المحترفين",
      price: "29.99$",
      frequency: "شهرياً",
      features: [
        "رفع مستندات غير محدود",
        "معالجة OCR المتقدمة",
        "دعم الأولوية",
        "الوصول إلى التحليلات",
      ],
      limitations: [],
    },
    {
      id: "pro",
      title: "خطة المحترفين",
      price: "29.99$",
      frequency: "شهرياً",
      features: [
        "رفع مستندات غير محدود",
        "معالجة OCR المتقدمة",
        "دعم الأولوية",
        "الوصول إلى التحليلات",
      ],
      limitations: [],
    },
  ];

  const handleSubscribe = async (planId: string) => {
    if (!isSignedIn) {
      toast.info("Please sign in to subscribe.");
      router.push("/sign-in");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/create-subscription", {
        planId,
      });
      window.location.href = response.data.url;
    } catch (error: any) {
      console.error("Subscription error:", error);
      const message =
        error.response?.data?.error || "Failed to create subscription. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

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

      <div className="mx-auto grid max-w-screen-lg gap-5 py-5 md:grid-cols-2 lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <div
            className="relative flex flex-col overflow-hidden rounded-xl border shadow-sm hover:shadow-md transition-shadow duration-300"
            key={plan.id}
          >
            <div className="min-h-[150px] bg-blue-200 p-6 flex flex-col justify-between">
              <p className="font-urban text-sm font-bold uppercase tracking-wider text-muted-foreground">
                {plan.title}
              </p>
              <div className="flex flex-row items-baseline">
                <span className="text-3xl font-semibold">{plan.price}</span>
                <span className="ml-2 text-sm font-medium">/{plan.frequency}</span>
              </div>
            </div>

            <div className="flex flex-col justify-between gap-6 p-6">
              <ul className="space-y-2 text-left text-sm font-medium">
                {plan.features.map((feature, idx) => (
                  <li className="flex items-start" key={idx}>
                    <Icons.Check className="mr-3 h-5 w-5 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
                {plan.limitations.map((limitation, idx) => (
                  <li className="flex items-start text-muted-foreground" key={idx}>
                    <Icons.Close className="mr-3 h-5 w-5 text-red-500" />
                    <span>{limitation}</span>
                  </li>
                ))}
              </ul>

              {currentUserId ? (
                plan.id === "starter" ? (
                  <Link href="/dashboard">
                    <Button variant="primary" className="w-full">
                      لوحة التحكم
                    </Button>
                  </Link>
                ) : (
                  <Button
                    variant="primary"
                    className="w-full"
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={isPro}
                  >
                    {isPro ? "You are Pro" : "Upgrade"}
                  </Button>
                )
              ) : (
                <Link href="/sign-up">
                  <Button variant="secondary" className="w-full">
                    التسجيل
                  </Button>
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="mt-3 text-center text-base text-muted-foreground">
        <Balancer>
          البريد الالكتروني{" "}
          <a
            className="font-medium text-primary hover:underline"
            href="mailto:admin@arabicocr.net"
          >
            admin@sharayeh.com
          </a>{" "}
راسلنا لاي استفسار
          <br />
          <strong>جاهزون للرد والدعم</strong>
        </Balancer>
      </p>

      {loading && <Loading />}
    </section>
  );
};

export default PricingSection;
