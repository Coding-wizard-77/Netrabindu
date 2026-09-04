import React from 'react';
import { Activity } from 'lucide-react';

export interface SentinelActivityGaugeProps {
  triggerRatePerMin?: number;
  activeEscalations?: number;
}

export const SentinelActivityGauge: React.FC<SentinelActivityGaugeProps> = ({
  triggerRatePerMin = 48,
  activeEscalations = 6,
}) => {
  return (
    <div className="glass-panel p-5 rounded-2xl border border-navy-700/80 shadow-2xl flex flex-col justify-between font-mono h-full space-y-4">
      <div className="flex items-center justify-between border-b border-navy-800 pb-2">
        <span className="text-xs font-bold uppercase text-slate-300">Always-On Edge Sentinel</span>
        <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 text-[10px] font-bold">ACTIVE</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
          <Activity className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <div className="text-2xl font-black text-white">{triggerRatePerMin} /min</div>
          <div className="text-[10px] text-slate-400">Trigger Rate (Motion + Plate ROI)</div>
        </div>
      </div>

      <div className="pt-3 border-t border-navy-800 flex items-center justify-between text-xs">
        <span className="text-slate-400">Active Tier Escalations:</span>
        <span className="text-amber-400 font-bold">{activeEscalations} Feeds in Critical</span>
      </div>
    </div>
  );
};
