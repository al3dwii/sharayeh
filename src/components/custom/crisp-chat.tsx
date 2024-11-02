"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export const CrispChat = () => {
  useEffect(() => {
    Crisp.configure("cf63eec9-f019-4fdb-86fd-7382d3223f14");
    $crisp.push(["config", "position:reverse", true]); // Replace 'true' with the correct value

  }, []);

  return null;
};
