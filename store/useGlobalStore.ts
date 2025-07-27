// store/useGlobalStore.ts
import { create } from 'zustand';

interface GlobalStoreState {
  shouldRefreshUserInfo: boolean;
  setShouldRefreshUserInfo: (refresh: boolean) => void;
}

export const useGlobalStore = create<GlobalStoreState>((set) => ({
  shouldRefreshUserInfo: false,
  setShouldRefreshUserInfo: (refresh: boolean) => set(() => ({ shouldRefreshUserInfo: refresh })),
}));
