"use client";

import axios from "axios";
import { useState } from "react";
import { Zap } from "lucide-react";
import { toast } from "react-hot-toast";

import  Button from "@/components/ui/Button2";
import Loading from '@/components/global/sloading'

export const SubscriptionButton = ({
  isPro = false
}: {
  isPro: boolean;
}) => {
  const [loading, setLoading] = useState(false);

  const onClick = async () => {
    try {
      setLoading(true);

      const response = await axios.get("/api/stripe");

      window.location.href = response.data.url;
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button disabled={loading} onClick={onClick} className="flex items-center">
      {loading ? (
        <Loading />
      ) : (
        <>
          {isPro ? "إدارة الاشتراك" : "الاشتراك"}
          {!isPro && <Zap className="w-4 h-4 ml-2 fill-white" />}
        </>
      )}
    </Button>
    // <Button  disabled={loading} onClick={onClick} >
    //   {isPro ? "إدارة الاشتراك" : "الاشتراك"}
    //   {!isPro && <Zap className="w-4 h-4 ml-2 fill-white" />}
    // </Button>
  )
};
