import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  activeDrawer: string | null;
  drawerData: any | null;
  openDrawer: (id: string, data?: any) => void;
  closeDrawer: () => void;
  audioMuted: boolean;
  toggleAudio: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  activeDrawer: null,
  drawerData: null,
  openDrawer: (id, data = null) => set({ activeDrawer: id, drawerData: data }),
  closeDrawer: () => set({ activeDrawer: null, drawerData: null }),
  audioMuted: false,
  toggleAudio: () => set((s) => ({ audioMuted: !s.audioMuted })),
}));
