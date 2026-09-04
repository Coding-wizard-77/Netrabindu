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
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-navy-800 bg-navy-950/90 px-4 backdrop-blur-md dark:border-navy-800 dark:bg-navy-950/95 light:bg-white light:border-slate-200">
      {/* Left: Branding & DEFCON Status */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-accent-blue/15 border border-accent-blue/30 text-accent-blue shadow-lg shadow-accent-blue/10">
            <Shield className="h-6 w-6 text-accent-blue" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-base font-black tracking-wider text-slate-100 light:text-slate-900 uppercase">
                NETRABINDU
              </span>
              <span className="rounded bg-navy-800 px-1.5 py-0.5 text-[10px] font-bold font-mono text-accent-cyan border border-navy-700">
                v2.4 SEC-SECURED
              </span>
            </div>
            <p className="text-[10px] font-semibold text-slate-400 tracking-tight">
              GUJARAT POLICE STATE SURVEILLANCE GRID
            </p>
          </div>
        </div>

        {/* Threat Level Badge */}
        <div className="hidden lg:flex items-center space-x-2 rounded-lg border border-navy-700 bg-navy-900/80 px-2.5 py-1 text-xs">
          <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
          <span className="font-mono font-bold text-slate-300">DEFCON 3</span>
          <span className="text-[10px] text-slate-400 border-l border-navy-700 pl-2">ACTIVE SENTINEL</span>
        </div>
      </div>

      {/* Center: Quick Plate Lookup Bar */}
      <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center relative max-w-sm w-full mx-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={quickPlate}
            onChange={(e) => setQuickPlate(e.target.value)}
            placeholder="Quick Search Plate (e.g. GJ01AB1234)..."
            className="w-full rounded-lg border border-navy-700 bg-navy-900/90 py-1.5 pl-9 pr-14 text-xs font-mono text-slate-100 placeholder-slate-500 focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue transition-colors uppercase"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded border border-navy-700 bg-navy-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
            ENTER
          </span>
        </div>
      </form>

      {/* Right: Actions, Clock & Tactical Toggles */}
      <div className="flex items-center space-x-3">
        {/* Quick Police Actions */}
        {onTriggerNakabandi && (
          <button
            onClick={() => {
              tacticalAudio.playKeyClick();
              onTriggerNakabandi();
            }}
            title="Trigger Nakabandi Lockdown (Hotkey: N)"
            className="hidden sm:flex items-center space-x-1.5 rounded-lg border border-red-500/40 bg-red-950/40 px-2.5 py-1.5 text-xs font-bold text-red-300 hover:bg-red-900/60 hover:border-red-400 transition-colors shadow-sm"
          >
            <Lock className="h-3.5 w-3.5 text-red-400" />
            <span>NAKABANDI</span>
            <kbd className="hidden md:inline rounded bg-red-950 px-1 py-0.2 text-[9px] font-mono border border-red-800">N</kbd>
          </button>
        )}

        {onOpenSitRep && (
          <button
            onClick={() => {
              tacticalAudio.playKeyClick();
              onOpenSitRep();
            }}
            title="Generate Daily Police SitRep (Hotkey: S)"
            className="hidden sm:flex items-center space-x-1.5 rounded-lg border border-navy-700 bg-navy-800/80 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:bg-navy-700 hover:text-slate-100 transition-colors shadow-sm"
          >
            <FileText className="h-3.5 w-3.5 text-accent-blue" />
            <span>SITREP</span>
            <kbd className="hidden md:inline rounded bg-navy-900 px-1 py-0.2 text-[9px] font-mono border border-navy-700">S</kbd>
          </button>
        )}

        {/* Live IST Clock */}
        <div className="hidden xl:flex items-center space-x-2 rounded-lg border border-navy-700 bg-navy-900/90 px-3 py-1 text-right">
          <Clock className="h-4 w-4 text-accent-cyan animate-pulse" />
          <div className="leading-tight">
            <div className="font-mono text-xs font-bold text-slate-100 tracking-wider">
              {timeStr || '12:00:00 IST'}
            </div>
            <div className="text-[10px] text-slate-400 font-medium">{dateStr}</div>
          </div>
        </div>

        {/* Alert Counter Indicator */}
        <div className="flex items-center space-x-1.5 rounded-lg border border-navy-700 bg-navy-900/80 px-2.5 py-1.5 text-xs">
          <AlertTriangle className={`h-4 w-4 ${activeAlertCount > 0 ? 'text-red-400 animate-bounce' : 'text-slate-500'}`} />
          <span className="font-mono font-bold text-slate-200">{activeAlertCount}</span>
          <span className="hidden md:inline text-[10px] text-slate-400 uppercase">Alerts</span>
        </div>

        {/* Audio Mute Toggle */}
        <button
          onClick={handleToggleMute}
          title={isMuted ? 'Unmute Tactical Siren & Chirps (Hotkey: M)' : 'Mute Tactical Siren & Chirps (Hotkey: M)'}
          className={`rounded-lg border p-2 text-xs transition-colors ${
            isMuted
              ? 'border-red-800/60 bg-red-950/40 text-red-400 hover:bg-red-900/50'
              : 'border-navy-700 bg-navy-800 text-accent-cyan hover:bg-navy-700'
          }`}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </button>

        {/* Keyboard Shortcuts Trigger */}
        <button
          onClick={() => {
            tacticalAudio.playKeyClick();
            onOpenShortcuts();
          }}
          title="Tactical Keyboard Shortcuts HUD (Hotkey: ?)"
          className="rounded-lg border border-navy-700 bg-navy-800 p-2 text-slate-300 hover:bg-navy-700 hover:text-slate-100 transition-colors"
        >
          <Keyboard className="h-4 w-4" />
        </button>

        {/* Light / Dark Mode Toggle */}
        <button
          onClick={() => {
            tacticalAudio.playKeyClick();
            onToggleDarkMode();
          }}
          title="Toggle Dark/Light Tactical Mode (Hotkey: T)"
          className="rounded-lg border border-navy-700 bg-navy-800 p-2 text-slate-300 hover:bg-navy-700 hover:text-slate-100 transition-colors"
        >
          {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-400" />}
        </button>
      </div>
    </header>
  );
};
