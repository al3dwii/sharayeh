"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

// Declare the global `$crisp` variable
declare global {
  interface Window {
    $crisp: any[];
  }
}

export const CrispChat: React.FC = (): React.ReactElement | null => {
  useEffect(() => {
    Crisp.configure("cf63eec9-f019-4fdb-86fd-7382d3223f14");

    if (typeof window !== "undefined") {
      window.$crisp = window.$crisp || [];
      window.$crisp.push(["config", "position:reverse", true]);
    }
  }, []);

  return null;
};


// "use client";

// import { useEffect } from "react";
// import { Crisp } from "crisp-sdk-web";

// export const CrispChat = () => {
//   useEffect(() => {
//     Crisp.configure("cf63eec9-f019-4fdb-86fd-7382d3223f14");
//     $crisp.push(["config", "position:reverse", true]); // Replace 'true' with the correct value

//   }, []);

//   return null;
// };
