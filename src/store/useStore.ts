// /Users/omair/arocr/apps/nextjs/src/store/useStore.ts

import { create } from 'zustand';

interface StoreState {
  session: any;
  setSession: (session: any) => void;
  credits: number | null;
  setCredits: (credits: number) => void;
  usedCredits: number | null;
  setUsedCredits: (usedCredits: number) => void;
 
}

export const useStore = create<StoreState>((set) => ({
  session: null,
  setSession: (session) => set({ session }),
  credits: null,
  setCredits: (credits) => set({ credits }),
  usedCredits: null,
  setUsedCredits: (usedCredits) => set({ usedCredits }),
}));

