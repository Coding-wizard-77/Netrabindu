import { create } from 'zustand';
import { Alert } from '../types';
import { alertSound } from '../utils/audio';

interface AlertStateStore {
  activeAlerts: Alert[];
  unreadCount: number;
  addLiveAlert: (alert: Alert, audioMuted?: boolean) => void;
  markAsRead: () => void;
  removeAlert: (id: string) => void;
}

export const useAlertStore = create<AlertStateStore>((set) => ({
  activeAlerts: [],
  unreadCount: 0,

  addLiveAlert: (alert, audioMuted = false) => {
    if (!audioMuted && (alert.severity === 'CRITICAL' || alert.severity === 'HIGH')) {
      alertSound.playCriticalAlertChime();
    }
    set((state) => ({
      activeAlerts: [alert, ...state.activeAlerts.slice(0, 49)], // Keep last 50
      unreadCount: state.unreadCount + 1,
    }));
  },

  markAsRead: () => set({ unreadCount: 0 }),
  removeAlert: (id) =>
    set((state) => ({
      activeAlerts: state.activeAlerts.filter((a) => a.id !== id),
    })),
}));
