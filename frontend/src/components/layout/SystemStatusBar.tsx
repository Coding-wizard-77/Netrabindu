import React, { useState, useEffect } from 'react';
import { Wifi, Radio, Clock, ShieldCheck, Volume2, VolumeX } from 'lucide-react';
import { formatToIST } from '../../utils/date';
import { useUIStore } from '../../store/useUIStore';

export const SystemStatusBar: React.FC = () => {
  const [time, setTime] = useState(new Date().toISOString());
  const { audioMuted, toggleAudio } = useUIStore();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toISOString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="h-7 bg-slate-900 dark:bg-[#070a11] border-b border-slate-800 px-4 flex items-center justify-between text-[11px] font-mono text-slate-300 dark:text-slate-400 select-none transition-colors">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold tracking-wider text-[10px] uppercase">STATE CORE CONNECTED</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-slate-300 dark:text-slate-400">
          <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
          <span>EVENT BUS: LIVE</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5 text-slate-300 dark:text-slate-400">
          <ShieldCheck className="w-3 h-3 text-indigo-400" />
          <span>GUJARAT POLICE SURVEILLANCE GRID</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggleAudio}
          className="flex items-center gap-1 text-slate-300 dark:text-slate-400 hover:text-white transition-colors"
          title={audioMuted ? 'Unmute alert audio' : 'Mute alert audio'}
        >
          {audioMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          <span className="text-[10px]">{audioMuted ? 'MUTED' : 'AUDIO ON'}</span>
        </button>

        <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
          <Clock className="w-3 h-3 text-cyan-400" />
          <span>{formatToIST(time, 'dd MMM yyyy, HH:mm:ss')}</span>
        </div>
      </div>
    </div>
  );
};
