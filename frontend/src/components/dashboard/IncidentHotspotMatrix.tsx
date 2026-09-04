import React from 'react';
import { AlertTriangle, MapPin, TrendingUp } from 'lucide-react';

export const IncidentHotspotMatrix: React.FC = () => {
  const hotspots = [
    { rank: 1, name: 'SG Highway Chanakyapuri Chokdi', hits: 38, risk: 'EXTREME', score: 96 },
    { rank: 2, name: 'SP Ring Road Bopal Toll Plaza', hits: 29, risk: 'HIGH', score: 84 },
    { rank: 3, name: 'Kalupur Railway Station Crossroad', hits: 24, risk: 'HIGH', score: 78 },
    { rank: 4, name: 'Geeta Mandir Central Bus Terminus', hits: 18, risk: 'MODERATE', score: 62 },
    { rank: 5, name: 'Narol Industrial Toll Barrier', hits: 14, risk: 'MODERATE', score: 51 },
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 border border-slate-200 dark:border-navy-700/80 shadow-2xl h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-500 dark:text-amber-400 border border-amber-500/30">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white font-mono tracking-wider uppercase">
                Incident Hotspot Matrix
              </h3>
              <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">High-frequency Red Notice corridors</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-bold text-amber-500 dark:text-amber-400">TOP 5 NODES</span>
        </div>

        <div className="space-y-2.5">
          {hotspots.map((h) => (
            <div
              key={h.rank}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-800/80 hover:border-amber-500/40 transition-colors flex items-center justify-between text-xs font-mono"
            >
              <div className="flex items-center gap-2.5">
                <span className="h-6 w-6 rounded-lg bg-slate-200 dark:bg-navy-850 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-navy-700 text-[11px]">
                  #{h.rank}
                </span>
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[160px] sm:max-w-[200px]">
                    {h.name}
                  </div>
                  <div className="text-[10px] text-slate-500">{h.hits} Sightings Logged</div>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    h.risk === 'EXTREME'
                      ? 'bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/40'
                      : h.risk === 'HIGH'
                      ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40'
                      : 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/40'
                  }`}
                >
                  {h.risk}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-200 dark:border-navy-800 flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> SG Highway Activity +18%
        </span>
        <span className="text-cyan-600 dark:text-cyan-400 font-bold">Auto-Sync 30s</span>
      </div>
    </div>
  );
};
