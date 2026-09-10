import { create } from 'zustand';
import { Camera } from '../types';

export type GridLayout = '1x1' | '2x2' | '3x3' | '1+5' | '4x4' | '5x5' | '6x6' | '50-GRID';

export const getLayoutSlotCount = (layout: GridLayout): number => {
  switch (layout) {
    case '1x1': return 1;
    case '2x2': return 4;
    case '3x3': return 9;
    case '1+5': return 6;
    case '4x4': return 16;
    case '5x5': return 25;
    case '6x6': return 36;
    case '50-GRID': return 50;
    default: return 16;
  }
};

const createInitialSlots = (count: number): Record<number, Camera | null> => {
  const slots: Record<number, Camera | null> = {};
  for (let i = 0; i < count; i++) {
    slots[i] = null;
  }
  return slots;
};

interface VideoWallState {
  layout: GridLayout;
  slots: Record<number, Camera | null>;
  selectedSlotIndex: number;
  setLayout: (layout: GridLayout) => void;
  assignCameraToSlot: (index: number, camera: Camera | null) => void;
  swapSlots: (sourceIndex: number, targetIndex: number) => void;
  batchAssignSlots: (newSlots: Record<number, Camera | null>) => void;
  populateAllCameras: (cameras: Camera[]) => void;
  setSelectedSlotIndex: (index: number) => void;
  clearWall: () => void;
}

export const useVideoWallStore = create<VideoWallState>((set) => ({
  layout: '4x4',
  slots: createInitialSlots(16),
  selectedSlotIndex: 0,

  setLayout: (layout) => {
    const slotCount = getLayoutSlotCount(layout);
    set((state) => {
      const newSlots: Record<number, Camera | null> = {};
      for (let i = 0; i < slotCount; i++) {
        newSlots[i] = state.slots[i] || null;
      }
      return { 
        layout, 
        slots: newSlots, 
        selectedSlotIndex: Math.min(state.selectedSlotIndex, slotCount - 1) 
      };
    });
  },

  assignCameraToSlot: (index, camera) =>
    set((state) => ({
      slots: { ...state.slots, [index]: camera },
    })),

  swapSlots: (sourceIndex, targetIndex) =>
    set((state) => {
      if (sourceIndex === targetIndex) return state;
      const sourceCam = state.slots[sourceIndex] ?? null;
      const targetCam = state.slots[targetIndex] ?? null;
      return {
        slots: {
          ...state.slots,
          [sourceIndex]: targetCam,
          [targetIndex]: sourceCam,
        },
        selectedSlotIndex: targetIndex,
      };
    }),

  batchAssignSlots: (newSlots) =>
    set((state) => ({
      slots: { ...state.slots, ...newSlots },
    })),

  populateAllCameras: (cameras) =>
    set((state) => {
      if (!cameras || cameras.length === 0) return state;
      const slotCount = getLayoutSlotCount(state.layout);
      const newSlots: Record<number, Camera | null> = {};
      for (let i = 0; i < slotCount; i++) {
        newSlots[i] = cameras[i % cameras.length] || null;
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
