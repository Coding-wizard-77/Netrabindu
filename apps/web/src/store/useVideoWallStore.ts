import { create } from 'zustand';
import { Camera } from '../types';

export type GridLayout = '1x1' | '2x2' | '3x3' | '1+5' | '4x4';

interface VideoWallState {
  layout: GridLayout;
  slots: Record<number, Camera | null>;
  selectedSlotIndex: number;
  setLayout: (layout: GridLayout) => void;
  assignCameraToSlot: (index: number, camera: Camera | null) => void;
  setSelectedSlotIndex: (index: number) => void;
  clearWall: () => void;
}

export const useVideoWallStore = create<VideoWallState>((set) => ({
  layout: '2x2',
  slots: { 0: null, 1: null, 2: null, 3: null },
  selectedSlotIndex: 0,

  setLayout: (layout) => {
    const slotCount = layout === '1x1' ? 1 : layout === '2x2' ? 4 : layout === '1+5' ? 6 : layout === '3x3' ? 9 : 16;
    set((state) => {
      const newSlots: Record<number, Camera | null> = {};
      for (let i = 0; i < slotCount; i++) {
        newSlots[i] = state.slots[i] || null;
      }
      return { layout, slots: newSlots, selectedSlotIndex: Math.min(state.selectedSlotIndex, slotCount - 1) };
    });
  },

  assignCameraToSlot: (index, camera) =>
    set((state) => ({
      slots: { ...state.slots, [index]: camera },
    })),

  setSelectedSlotIndex: (index) => set({ selectedSlotIndex: index }),
  clearWall: () =>
    set((state) => {
      const cleared: Record<number, Camera | null> = {};
      Object.keys(state.slots).forEach((k) => {
        cleared[Number(k)] = null;
      });
      return { slots: cleared };
    }),
}));
