import { create } from 'zustand';
import { Camera } from '../types';

export type GridLayout = '1x1' | '2x2' | '3x3' | '1+5' | '4x4' | '5x5' | '6x6' | '50-GRID';

interface VideoWallState {
  layout: GridLayout;
  slots: Record<number, Camera | null>;
  selectedSlotIndex: number;
  setLayout: (layout: GridLayout) => void;
  assignCameraToSlot: (index: number, camera: Camera | null) => void;
  populateAllCameras: (cameras: Camera[]) => void;
  setSelectedSlotIndex: (index: number) => void;
  clearWall: () => void;
}

export const useVideoWallStore = create<VideoWallState>((set) => ({
  layout: '4x4',
  slots: { 0: null, 1: null, 2: null, 3: null },
  selectedSlotIndex: 0,

  setLayout: (layout) => {
    const slotCount =
      layout === '1x1' ? 1 :
      layout === '2x2' ? 4 :
      layout === '1+5' ? 6 :
      layout === '3x3' ? 9 :
      layout === '4x4' ? 16 :
      layout === '5x5' ? 25 :
      layout === '6x6' ? 36 : 50;

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

  populateAllCameras: (cameras) =>
    set((state) => {
      const newSlots: Record<number, Camera | null> = {};
      const targetCount = state.layout === '50-GRID' ? 50 : Object.keys(state.slots).length;
      for (let i = 0; i < Math.max(targetCount, cameras.length); i++) {
        newSlots[i] = cameras[i] || null;
      }
      return { slots: newSlots };
    }),

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
