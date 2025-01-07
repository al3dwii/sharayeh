// components/Providers.tsx

'use client'; // Ensures this component is treated as a client component

import React from 'react';
import UserContext from '@/context/UserContext';
import { UserData } from '@/lib/getAllUserData';
import { ThemeProvider } from '@/providers/theme-provider';
import { ModalProvider } from '@/components/modal-provider';
import  Navbar from '@/components/custom/Navbar';
import { Footer } from "@/components/gadawel/footer";
// import ProModal from '@/components/ProModal';
import { ToasterProvider } from '@/components/toaster-provider';
import { Toaster as SonnarToaster } from '@/components/ui/sonner';
import { CrispProvider } from '@/components/custom/crisp-provider';

interface ProvidersProps {
  children: React.ReactNode;
  userData: UserData | null;
}

const Providers = ({ children, userData }: ProvidersProps) => {
  return (
    <UserContext.Provider value={userData}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <ModalProvider />
          <Navbar />
            {children}
          <Footer />
          {/* <ProModal /> */}
          <ToasterProvider />
          <SonnarToaster position="bottom-left" />
          <CrispProvider />
        </ThemeProvider>
    </UserContext.Provider>
  );
};

export default Providers;
