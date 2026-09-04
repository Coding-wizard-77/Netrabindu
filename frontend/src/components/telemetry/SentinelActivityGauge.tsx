import React from 'react';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

interface SentinelActivityGaugeProps {
  triggerRatePerMin: number;
  activeEscalations: number;
}

export const SentinelActivityGauge: React.FC<SentinelActivityGaugeProps> = ({
  triggerRatePerMin = 48,
  activeEscalations = 6,
}) => {
  return (
    <div className="p-4 bg-[#0f172a] rounded-xl border border-slate-800 flex items-center justify-between font-mono">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-400">
          <Activity className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <span className="text-[10px] text-slate-400 uppercase">Always-On Edge Sentinel</span>
          <div className="text-sm font-bold text-white">{triggerRatePerMin} triggers / min</div>
        </div>
      </div>

      <div className="text-right">
        <span className="text-[10px] text-slate-400 uppercase">Active Task Escalations</span>
        <div className="text-sm font-bold text-amber-400">{activeEscalations} feeds in Active Tier</div>
      </div>
    </div>
  );
};
