import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SystemStatusBar } from './SystemStatusBar';
import { KeyboardShortcutsModal } from '../common/KeyboardShortcutsModal';
import { NakabandiLockdownModal } from '../police/NakabandiLockdownModal';
import { DailyPoliceSitRepModal } from '../police/DailyPoliceSitRepModal';
import { tacticalAudio } from '../../utils/audio';

import { useUIStore } from '../../store/useUIStore';

export type ViewType =
  | 'dashboard'
  | 'live-matrix'
  | 'events'
  | 'alerts'
  | 'investigation'
  | 'cameras'
  | 'watchlists'
  | 'health'
  | 'audit';

export interface AppLayoutProps {
  currentView?: ViewType;
  onNavigate?: (view: ViewType) => void;
  children?: React.ReactNode;
  activeAlertCount?: number;
  onSearchPlate?: (plate: string) => void;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentView,
  onNavigate,
  children,
  activeAlertCount = 0,
  onSearchPlate,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const { theme, toggleTheme, setTheme } = useUIStore();
  const darkMode = theme === 'dark';

  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [isNakabandiOpen, setIsNakabandiOpen] = useState<boolean>(false);
  const [isSitRepOpen, setIsSitRepOpen] = useState<boolean>(false);

  // Apply dark/light mode class to root HTML element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  }, [theme]);

  const toggleDarkMode = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  const handleNavigate = useCallback(
    (view: ViewType) => {
      if (onNavigate) {
        onNavigate(view);
        return;
      }
      switch (view) {
        case 'dashboard':
          navigate('/');
          break;
        case 'live-matrix':
          navigate('/live');
          break;
        case 'events':
          navigate('/events');
          break;
        case 'alerts':
          navigate('/alerts');
          break;
        case 'investigation':
          navigate('/investigation');
          break;
        case 'cameras':
          navigate('/cameras');
          break;
        case 'watchlists':
          navigate('/watchlists');
          break;
        case 'health':
          navigate('/health');
          break;
        case 'audit':
          navigate('/audit');
          break;
        default:
          navigate('/');
      }
    },
    [navigate, onNavigate]
  );

  const handleSearch = useCallback(
    (plate: string) => {
      if (onSearchPlate) {
        onSearchPlate(plate);
      } else {
        navigate(`/investigation?plate=${encodeURIComponent(plate)}`);
      }
    },
    [navigate, onSearchPlate]
  );

  // Global Tactical Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl instanceof HTMLInputElement ||
        activeEl instanceof HTMLTextAreaElement ||
        activeEl instanceof HTMLSelectElement;

      if (e.key === 'Escape') {
        setIsShortcutsOpen(false);
        setIsNakabandiOpen(false);
        setIsSitRepOpen(false);
        return;
      }

      if (isInput) return;

      switch (e.key) {
        case '1':
          tacticalAudio.playKeyClick();
          handleNavigate('dashboard');
          break;
        case '2':
          tacticalAudio.playKeyClick();
          handleNavigate('live-matrix');
          break;
        case '3':
          tacticalAudio.playKeyClick();
          handleNavigate('events');
          break;
        case '4':
          tacticalAudio.playKeyClick();
          handleNavigate('alerts');
          break;
        case '5':
          tacticalAudio.playKeyClick();
          handleNavigate('investigation');
          break;
        case '6':
          tacticalAudio.playKeyClick();
          handleNavigate('cameras');
          break;
        case '7':
          tacticalAudio.playKeyClick();
          handleNavigate('watchlists');
          break;
        case '8':
          tacticalAudio.playKeyClick();
          handleNavigate('health');
          break;
        case '9':
          tacticalAudio.playKeyClick();
          handleNavigate('audit');
          break;
        case 'n':
        case 'N':
          tacticalAudio.playKeyClick();
          setIsNakabandiOpen(true);
          break;
        case 's':
        case 'S':
          tacticalAudio.playKeyClick();
          setIsSitRepOpen(true);
          break;
        case 't':
        case 'T':
          tacticalAudio.playKeyClick();
          toggleDarkMode();
          break;
        case 'm':
        case 'M':
          tacticalAudio.toggleMute();
          break;
        case '?':
          tacticalAudio.playKeyClick();
          setIsShortcutsOpen((prev) => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNavigate, toggleDarkMode]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 text-slate-900 dark:bg-navy-950 dark:text-slate-100 font-sans antialiased transition-colors duration-200">
      {/* Tactical Sidebar */}
      <Sidebar />

      {/* Main Command Center Canvas */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          activeAlertCount={activeAlertCount}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onTriggerNakabandi={() => setIsNakabandiOpen(true)}
          onOpenSitRep={() => setIsSitRepOpen(true)}
          onSearchPlate={handleSearch}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-100/70 dark:bg-navy-900/40 relative transition-colors duration-200">
          {children || <Outlet />}
        </main>

        <SystemStatusBar />
      </div>

      {/* Tactical Modals */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />

      <NakabandiLockdownModal
        isOpen={isNakabandiOpen}
        onClose={() => setIsNakabandiOpen(false)}
      />

      <DailyPoliceSitRepModal
        isOpen={isSitRepOpen}
        onClose={() => setIsSitRepOpen(false)}
      />
    </div>
  );
};
