import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light';

interface UIState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  activeDrawer: string | null;
  drawerData: any | null;
  openDrawer: (id: string, data?: any) => void;
  closeDrawer: () => void;
  audioMuted: boolean;
  toggleAudio: () => void;
  initializeTheme: () => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  theme: (localStorage.getItem('netrabindu_theme') as ThemeMode) || 'dark',

  setTheme: (theme) => {
    localStorage.setItem('netrabindu_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
    set({ theme });
  },

  toggleTheme: () => {
    const current = get().theme;
    const next = current === 'dark' ? 'light' : 'dark';
    get().setTheme(next);
  },

  initializeTheme: () => {
    const saved = (localStorage.getItem('netrabindu_theme') as ThemeMode) || 'dark';
    get().setTheme(saved);
  },

  sidebarOpen: true,
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  activeDrawer: null,
  drawerData: null,
  openDrawer: (id, data = null) => set({ activeDrawer: id, drawerData: data }),
  closeDrawer: () => set({ activeDrawer: null, drawerData: null }),
  audioMuted: false,
  toggleAudio: () => set((s) => ({ audioMuted: !s.audioMuted })),
}));
