// src/components/custom/ClientToast.tsx
"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

interface ClientToastProps {
  message: string;
}

const ClientToast: React.FC<ClientToastProps> = ({ message }) => {
  useEffect(() => {
    toast(message, {
      icon: "❌",
      style: { backgroundColor: "#f56565", color: "#fff" },
    });
  }, [message]);

  return null; // This component doesn’t render anything
};

export default ClientToast;
