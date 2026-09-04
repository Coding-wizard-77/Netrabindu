import { create } from 'zustand';
import { User, AuthSession } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setSession: (session: AuthSession) => void;
  logout: () => void;
  initializeFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  setSession: (session) => {
    localStorage.setItem('netrabindu_access_token', session.access_token);
    localStorage.setItem('netrabindu_user', JSON.stringify(session.user));
    set({
      user: session.user,
      token: session.access_token,
      isAuthenticated: true,
    });
  },

  logout: () => {
    localStorage.removeItem('netrabindu_access_token');
    localStorage.removeItem('netrabindu_user');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  initializeFromStorage: () => {
    const token = localStorage.getItem('netrabindu_access_token');
    const userJson = localStorage.getItem('netrabindu_user');
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        set({ user, token, isAuthenticated: true });
      } catch {
        set({ user: null, token: null, isAuthenticated: false });
      }
    }
  },
}));
