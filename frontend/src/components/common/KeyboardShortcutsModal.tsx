import React from 'react';
import { X, Command, Radio, ShieldAlert, FileText, SunMoon, Volume2, Search, Video, Eye, Database, Activity, Lock } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcutGroups = [
    {
      title: 'Tactical Navigation (Direct Numbers)',
      shortcuts: [
        { key: '1', desc: 'Command Dashboard (Real-Time Overview)', icon: Activity },
        { key: '2', desc: 'Live View Matrix (Multi-Camera Wall)', icon: Video },
        { key: '3', desc: 'ANPR Event Stream (Live Telemetry)', icon: Eye },
        { key: '4', desc: 'Alerts & Hotlist Detections', icon: ShieldAlert },
        { key: '5', desc: 'Forensic Investigation & Trajectory Replay', icon: Search },
        { key: '6', desc: 'Camera Registry & Stream Diagnostics', icon: Video },
        { key: '7', desc: 'Vehicle Watchlists & Red Notice Manager', icon: Database },
        { key: '8', desc: 'System Health & Edge GPU Telemetry', icon: Activity },
        { key: '9', desc: 'Audit Ledger & Section 65B Logs', icon: FileText },
      ],
    },
    {
      title: 'Police Command Hotkeys',
      shortcuts: [
        { key: 'N', desc: 'Trigger Nakabandi Checkpost Lockdown', icon: Lock },
        { key: 'S', desc: 'Generate 24h Daily Police Situation Report (SitRep)', icon: FileText },
        { key: 'P', desc: 'Dispatch PCR Patrol Units', icon: Radio },
        { key: 'T', desc: 'Toggle Dark / Light Tactical Display Mode', icon: SunMoon },
        { key: 'M', desc: 'Mute / Unmute Audio Siren & Radio Chirps', icon: Volume2 },
        { key: '?', desc: 'Open / Close this Keyboard Shortcuts HUD', icon: Command },
        { key: 'ESC', desc: 'Close any active modal, drawer, or dialog', icon: X },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl rounded-xl border border-navy-700 bg-navy-900 dark:bg-navy-950 p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between border-b border-navy-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-accent-blue/10 p-2 text-accent-blue border border-accent-blue/20">
              <Command className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                Police Command Center Keyboard HUD
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">TACTICAL MODE</span>
              </h2>
              <p className="text-xs text-slate-400">High-speed keyboard navigation for control room dispatchers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-navy-800 hover:text-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto pr-2">
          {shortcutGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-navy-800/80 pb-1">
                {group.title}
              </h3>
              <div className="space-y-2">
                {group.shortcuts.map((sc, sIdx) => {
                  const Icon = sc.icon;
                  return (
                    <div
                      key={sIdx}
                      className="flex items-center justify-between rounded-lg bg-navy-800/60 p-2.5 hover:bg-navy-800 border border-navy-700/50 transition-colors"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Icon className="h-4 w-4 text-accent-blue/80" />
                        <span className="text-xs text-slate-300 font-medium">{sc.desc}</span>
                      </div>
                      <kbd className="rounded border border-navy-600 bg-navy-950 px-2 py-1 text-xs font-mono font-bold text-accent-cyan shadow-inner min-w-[28px] text-center">
                        {sc.key}
                      </kbd>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-navy-800 pt-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Keyboard shortcuts are active globally across all command center views.</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-navy-800 px-4 py-1.5 text-xs font-semibold text-slate-200 hover:bg-navy-700 transition-colors"
          >
            Dismiss (ESC)
          </button>
        </div>
      </div>
    </div>
  );
};
