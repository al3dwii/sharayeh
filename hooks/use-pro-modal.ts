// hooks/useProModal.ts

import { create } from 'zustand';

interface ProModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export const useProModal = create<ProModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));



// import { create } from 'zustand';

// interface useProModalStore {
//   isOpen: boolean;
//   onOpen: () => void;
//   onClose: () => void;
// }

// export const useProModal = create<useProModalStore>((set) => ({
//   isOpen: false,
//   onOpen: () => set({ isOpen: true }),
//   onClose: () => set({ isOpen: false }),
// }));
