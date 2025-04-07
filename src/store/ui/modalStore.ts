// src/store/ui/modalStore.ts
import { create } from 'zustand';

interface ModalState {
  activeModals: Record<string, boolean>;
  modalData: Record<string, any>;
  
  // Actions
  openModal: (modalId: string, data?: any) => void;
  closeModal: (modalId: string) => void;
  setModalData: (modalId: string, data: any) => void;
}

export const modalStore = create<ModalState>((set) => ({
  activeModals: {},
  modalData: {},
  
  openModal: (modalId, data) => set((state) => ({
    activeModals: { ...state.activeModals, [modalId]: true },
    modalData: data ? { ...state.modalData, [modalId]: data } : state.modalData
  })),
  
  closeModal: (modalId) => set((state) => ({
    activeModals: { ...state.activeModals, [modalId]: false }
  })),
  
  setModalData: (modalId, data) => set((state) => ({
    modalData: { ...state.modalData, [modalId]: data }
  }))
}));
