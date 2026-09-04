import React from 'react';
import { Layers, CheckCircle2 } from 'lucide-react';

export const DepartmentDistributionChart: React.FC = () => {
  const departments = [
    { name: 'City Police & Crime Branch', cams: 4210, pct: 34, color: 'from-cyan-500 to-blue-600' },
    { name: 'Traffic Police & ANPR Grid', cams: 3680, pct: 29, color: 'from-emerald-500 to-teal-600' },
    { name: 'Highway Patrol & Toll Plazas', cams: 2450, pct: 20, color: 'from-amber-500 to-orange-600' },
    { name: 'Municipal Smart City (AMC/SMC)', cams: 1420, pct: 11, color: 'from-violet-500 to-purple-600' },
    { name: 'Port & Coastal Security', cams: 720, pct: 6, color: 'from-rose-500 to-pink-600' },
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 border border-navy-700/80 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-navy-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white font-mono tracking-wider uppercase">
              26 Department CCTV Network Distribution
            </h3>
            <p className="text-[10px] font-mono text-slate-400">
              State-wide Unified Inter-Department Surveillance Grid
            </p>
          </div>
        </div>
        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-[10px] font-bold border border-blue-500/40">
          12,480 TOTAL CAMS
        </span>
      </div>

      <div className="space-y-3">
        {departments.map((d, i) => (
          <div key={i} className="space-y-1 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-medium">{d.name}</span>
              <span className="text-slate-400">
                <strong className="text-white font-bold">{d.cams.toLocaleString()}</strong> ({d.pct}%)
              </span>
            </div>
            <div className="w-full bg-navy-950 h-2 rounded-full overflow-hidden border border-navy-800">
              <div
                className={`h-full bg-gradient-to-r ${d.color} rounded-full transition-all duration-500`}
                style={{ width: `${d.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
