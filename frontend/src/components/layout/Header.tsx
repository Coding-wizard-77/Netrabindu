import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Clock, 
  Volume2, 
  VolumeX, 
  Sun, 
  Moon, 
  Keyboard, 
  Search, 
  AlertTriangle,
  Radio,
  Lock,
  FileText
} from 'lucide-react';
import { tacticalAudio } from '../../utils/audio';
import { SentinelGridValidatorModal } from '../sentinel/SentinelGridValidatorModal';

interface HeaderProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  activeAlertCount: number;
  onOpenShortcuts: () => void;
  onTriggerNakabandi?: () => void;
  onOpenSitRep?: () => void;
  onSearchPlate?: (plate: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  darkMode,
  onToggleDarkMode,
  activeAlertCount,
  onOpenShortcuts,
  onTriggerNakabandi,
  onOpenSitRep,
  onSearchPlate,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(tacticalAudio.isMuted());
  const [quickPlate, setQuickPlate] = useState<string>('');
  const [sentinelModalOpen, setSentinelModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' IST'
      );
      setDateStr(
        now.toLocaleDateString('en-IN', {
          timeZone: 'Asia/Kolkata',
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleMute = () => {
    const newMute = tacticalAudio.toggleMute();
    setIsMuted(newMute);
    if (!newMute) {
      tacticalAudio.playRadioChirp();
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickPlate.trim() && onSearchPlate) {
      tacticalAudio.playKeyClick();
      onSearchPlate(quickPlate.trim().toUpperCase());
      setQuickPlate('');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md dark:border-navy-800 dark:bg-navy-950/95 transition-colors select-none">
      {/* Left: Operational State & DEFCON Badge (No duplicate brand logo) */}
      <div className="flex items-center space-x-3 shrink-0">
        <div className="flex items-center space-x-2 rounded-xl border border-cyan-500/30 bg-cyan-950/30 px-3 py-1.5 text-xs shadow-inner">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono font-black text-cyan-400 tracking-wider text-[11px] uppercase">STATE GRID LIVE</span>
          <span className="text-slate-600 dark:text-navy-700">•</span>
          <span className="font-mono text-[10px] text-slate-400 font-bold hidden sm:inline">51 NODES</span>
        </div>

        <div className="hidden lg:flex items-center space-x-2 rounded-xl border border-slate-200 bg-slate-100/80 dark:border-navy-800 dark:bg-navy-900/90 px-3 py-1.5 text-xs shadow-sm">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="font-mono font-black text-slate-800 dark:text-amber-300 tracking-wider">DEFCON 3</span>
          <span className="text-[10px] font-mono text-slate-400 border-l border-slate-300 dark:border-navy-700 pl-2 uppercase font-semibold">ACTIVE SENTINEL</span>
        </div>
      </div>

      {/* Center: Quick Plate Lookup Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative flex-1 max-w-md mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-cyan-500" />
          <input
            type="text"
            value={quickPlate}
            onChange={(e) => setQuickPlate(e.target.value)}
            placeholder="QUICK SEARCH PLATE (E.G. GJ01AB1234)..."
            className="w-full rounded-xl border border-slate-300 bg-slate-50 dark:border-navy-800 dark:bg-navy-900/90 py-1.5 pl-9 pr-14 text-xs font-mono text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500 transition-colors uppercase"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-slate-300 bg-slate-200 dark:border-navy-700 dark:bg-navy-800 px-1.5 py-0.5 text-[9px] font-mono font-bold text-slate-600 dark:text-slate-400">
            ENTER
          </span>
        </div>
      </form>

      {/* Right: Actions, Clock & Tactical Toggles */}
      <div className="flex items-center space-x-2 shrink-0">
        {/* Gujarat Sentinel Grid Live Validator Button */}
        <button
          onClick={() => {
            tacticalAudio.playKeyClick();
            setSentinelModalOpen(true);
          }}
          title="Open Gujarat Police Sentinel Grid Ingestion & Stream Diagnostics"
          className="flex items-center space-x-1.5 rounded-xl border border-cyan-500/40 bg-cyan-950/40 px-3 py-1.5 text-xs font-bold text-cyan-300 hover:bg-cyan-900/60 hover:border-cyan-400 transition-all shadow-glow-cyan"
        >
          <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          <span className="font-mono tracking-wider">SENTINEL GRID</span>
          <span className="rounded bg-cyan-500/20 px-1.5 py-0.2 text-[9px] font-mono text-cyan-300 border border-cyan-500/40">51</span>
        </button>

        {/* Quick Police Actions */}
        {onTriggerNakabandi && (
          <button
            onClick={() => {
              tacticalAudio.playKeyClick();
              onTriggerNakabandi();
            }}
            title="Trigger Nakabandi Lockdown (Hotkey: N)"
            className="hidden sm:flex items-center space-x-1.5 rounded-xl border border-rose-500/40 bg-rose-950/40 px-3 py-1.5 text-xs font-bold text-rose-300 hover:bg-rose-900/60 hover:border-rose-400 transition-all shadow-sm"
          >
            <Lock className="h-3.5 w-3.5 text-rose-400" />
            <span className="font-mono tracking-wider">NAKABANDI</span>
            <kbd className="hidden md:inline rounded bg-rose-950 px-1 py-0.2 text-[9px] font-mono border border-rose-800">N</kbd>
          </button>
        )}

        {onOpenSitRep && (
          <button
            onClick={() => {
              tacticalAudio.playKeyClick();
              onOpenSitRep();
            }}
            title="Generate Daily Police SitRep (Hotkey: S)"
            className="hidden sm:flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-slate-100 dark:border-navy-800 dark:bg-navy-900/90 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-navy-800 hover:text-slate-900 dark:hover:text-slate-100 transition-all shadow-sm"
          >
            <FileText className="h-3.5 w-3.5 text-cyan-400" />
            <span className="font-mono tracking-wider">SITREP</span>
            <kbd className="hidden md:inline rounded bg-slate-200 dark:bg-navy-800 px-1 py-0.2 text-[9px] font-mono border border-slate-300 dark:border-navy-700">S</kbd>
          </button>
        )}

        {/* Live IST Clock */}
        <div className="hidden xl:flex items-center space-x-2 rounded-xl border border-slate-200 bg-slate-100 dark:border-navy-800 dark:bg-navy-900/90 px-3 py-1 text-right">
          <Clock className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          <div className="leading-tight">
            <div className="font-mono text-xs font-black text-slate-900 dark:text-slate-100 tracking-wider">
              {timeStr || '12:00:00 IST'}
            </div>
            <div className="text-[9px] text-slate-500 dark:text-slate-400 font-mono font-medium">{dateStr}</div>
          </div>
        </div>

        {/* Alert Counter Indicator */}
        <div className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-slate-100 dark:border-navy-800 dark:bg-navy-900/90 px-3 py-1.5 text-xs">
          <AlertTriangle className={`h-3.5 w-3.5 ${activeAlertCount > 0 ? 'text-rose-500 animate-bounce' : 'text-slate-400'}`} />
          <span className="font-mono font-black text-slate-800 dark:text-slate-200">{activeAlertCount}</span>
          <span className="hidden md:inline text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">Alerts</span>
        </div>

        {/* Audio Mute Toggle */}
        <button
          onClick={handleToggleMute}
          title={isMuted ? 'Unmute Tactical Siren & Chirps (Hotkey: M)' : 'Mute Tactical Siren & Chirps (Hotkey: M)'}
          className={`rounded-xl border p-2 text-xs transition-colors ${
            isMuted
              ? 'border-rose-800/60 bg-rose-950/40 text-rose-400 hover:bg-rose-900/50'
              : 'border-slate-200 bg-slate-100 text-cyan-600 hover:bg-slate-200 dark:border-navy-800 dark:bg-navy-900 dark:text-cyan-400 dark:hover:bg-navy-800'
          }`}
        >
          {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
        </button>

        {/* Keyboard Shortcuts Trigger */}
        <button
          onClick={() => {
            tacticalAudio.playKeyClick();
            onOpenShortcuts();
          }}
          title="Tactical Keyboard Shortcuts HUD (Hotkey: ?)"
          className="rounded-xl border border-slate-200 bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:border-navy-800 dark:bg-navy-900 dark:text-slate-300 dark:hover:bg-navy-800 dark:hover:text-slate-100 transition-colors"
        >
          <Keyboard className="h-3.5 w-3.5" />
        </button>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={() => {
            tacticalAudio.playKeyClick();
            onToggleDarkMode();
          }}
          title="Toggle Dark/Light Tactical Mode (Hotkey: T)"
          className="rounded-xl border border-slate-200 bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:border-navy-800 dark:bg-navy-900 dark:text-slate-300 dark:hover:bg-navy-800 dark:hover:text-slate-100 transition-colors shadow-sm"
        >
          {darkMode ? <Sun className="h-3.5 w-3.5 text-amber-400 animate-spin-slow" /> : <Moon className="h-3.5 w-3.5 text-indigo-500" />}
        </button>
      </div>

      <SentinelGridValidatorModal
        isOpen={sentinelModalOpen}
        onClose={() => setSentinelModalOpen(false)}
      />
    </header>
  );
};
