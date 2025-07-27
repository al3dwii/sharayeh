"use client";

import { Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import Button from "@/components/ui/Button2";
import { Progress } from "@/components/ui/progress";
import { useProModal } from "@/hooks/use-pro-modal";
import { useGlobalStore } from "@/store/useGlobalStore";

import Link from "next/link";
import Skel from "@/components/global/Skeleton";
import { useUserData } from "@/context/UserContext";

export const UserInfo = () => {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { user, isLoaded } = useUser();
  const proModal = useProModal();
  const router = useRouter();

  // Grab the entire userData from context
  const userData = useUserData();
  // userData has shape:
  // {
  //   userCredits: { credits, usedCredits, ... } | null,
  //   userPackages: [...]
  //   ...
  // }

  // Access userCredits safely:
  const credits = userData?.userCredits?.credits ?? 0;
  const usedCredits = userData?.userCredits?.usedCredits ?? 0;

  const shouldRefreshUserInfo = useGlobalStore(
    (state) => state.shouldRefreshUserInfo
  );
  const setShouldRefreshUserInfo = useGlobalStore(
    (state) => state.setShouldRefreshUserInfo
  );

  useEffect(() => {
    setMounted(true);
    router.refresh(); // If you want to trigger a route refresh
  }, [router]);

  useEffect(() => {
    if (shouldRefreshUserInfo) {
      router.refresh();
      setShouldRefreshUserInfo(false);
    }
  }, [router, shouldRefreshUserInfo, setShouldRefreshUserInfo]);

  if (!mounted) {
    return null;
  }

  if (error) {
    return (
      <div className="px-3">
        <Card className="bg-red-200 border-0">
          <CardContent className="py-6">
            <p className="text-center text-sm text-red-800">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalCredits = credits + usedCredits;
  const progressValue = totalCredits > 0 ? (usedCredits / totalCredits) * 100 : 0;

  return (
    <div className="m-auto px-3 max-w-[800px]">
      <Card className="bg-blue-100 border-0">
        <CardContent className="py-6">
          <div className="text-center text-sm text-black mb-4 space-y-2">
            <p>
              النقاط المستخدمة: {usedCredits} / إجمالي النقاط: {totalCredits}
            </p>
            <Progress className="h-3" value={progressValue} />
          </div>
          <div className="flex justify-center">
            <Link href="/pricing">
              <Button className="w-40 bg-blue-500 flex items-center justify-center">
                اضافة رصيد
                <Zap className="w-4 h-4 mr-2 fill-white" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

