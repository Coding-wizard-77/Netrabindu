import React from 'react';
import { Radio, ShieldAlert, Navigation, Zap } from 'lucide-react';

export const LiveRadarScanner: React.FC = () => {
  const radarTargets = [
    { id: 1, plate: 'GJ01AB1234', cam: 'SG Highway Chanakyapuri', dist: '1.2 km', bearing: 'NE 42°', threat: 'CRITICAL' },
    { id: 2, plate: 'GJ05CD5678', cam: 'SP Ring Road Bopal Toll', dist: '3.8 km', bearing: 'SW 210°', threat: 'HIGH' },
    { id: 3, plate: 'GJ27XY9900', cam: 'Geeta Mandir Central Bus Terminus', dist: '5.4 km', bearing: 'SE 135°', threat: 'MEDIUM' },
  ];

  return (
    <div className="glass-panel rounded-2xl p-5 relative overflow-hidden border border-slate-200 dark:border-navy-700/80 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-500 dark:text-cyan-400 border border-cyan-500/30">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white font-mono tracking-wider uppercase">
              Adaptive Sentinel Proximity Radar
            </h3>
            <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              Active spatial threat interception vectoring • 25 km Perimeter Grid
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
            360° SWEEP LIVE
          </span>
        </div>
      </div>

      {/* Grid: Radar Canvas + Threat Target List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Radar Graphic */}
        <div className="relative flex items-center justify-center p-4">
          <div className="relative h-56 w-56 rounded-full border-2 border-cyan-500/30 bg-slate-900 dark:bg-navy-950/90 flex items-center justify-center shadow-glow-cyan/20">
            {/* Concentric rings */}
            <div className="absolute h-40 w-40 rounded-full border border-cyan-500/25" />
            <div className="absolute h-24 w-24 rounded-full border border-cyan-500/20" />
            <div className="absolute h-8 w-8 rounded-full border border-cyan-500/40 bg-cyan-500/10" />

            {/* Grid Crosshairs */}
            <div className="absolute h-full w-[1px] bg-cyan-500/20" />
            <div className="absolute w-full h-[1px] bg-cyan-500/20" />
            <div className="absolute h-full w-[1px] bg-cyan-500/10 rotate-45" />
            <div className="absolute h-full w-[1px] bg-cyan-500/10 -rotate-45" />

            {/* Rotating Radar Sweep Line */}
            <div className="absolute inset-0 rounded-full animate-radar-sweep pointer-events-none">
              <div className="h-1/2 w-1/2 bg-gradient-to-br from-cyan-400/40 to-transparent rounded-tl-full" />
            </div>

            {/* Target Blips */}
            <div
              className="absolute top-12 right-14 h-3 w-3 rounded-full bg-rose-500 shadow-glow-red animate-ping"
              title="Target: GJ01AB1234"
            />
            <div className="absolute top-12 right-14 h-2.5 w-2.5 rounded-full bg-rose-500" />

            <div
              className="absolute bottom-16 left-12 h-3 w-3 rounded-full bg-amber-400 shadow-glow-amber animate-ping"
              title="Target: GJ05CD5678"
            />
            <div className="absolute bottom-16 left-12 h-2.5 w-2.5 rounded-full bg-amber-400" />

            <div
              className="absolute bottom-10 right-16 h-2 w-2 rounded-full bg-cyan-400 shadow-glow-cyan animate-pulse"
              title="Target: GJ27XY9900"
            />

            {/* Center Position */}
            <div className="relative z-10 h-2 w-2 rounded-full bg-white shadow-lg" />
          </div>
        </div>

        {/* Real-time Target Intercept Vectors */}
        <div className="space-y-2.5">
          <div className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase">
            Identified Target Proximity Vectors
          </div>
          <div className="space-y-2">
            {radarTargets.map((t) => (
              <div
                key={t.id}
                className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-navy-800 hover:border-cyan-500/40 transition-colors flex items-center justify-between text-xs font-mono"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white tracking-widest">{t.plate}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        t.threat === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-500 dark:text-rose-400 border border-rose-500/40'
                          : 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40'
                      }`}
                    >
                      {t.threat}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[180px]">{t.cam}</div>
                </div>

                <div className="text-right space-y-0.5">
                  <div className="text-cyan-600 dark:text-cyan-400 font-bold">{t.dist}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1 justify-end">
                    <Navigation className="w-2.5 h-2.5 text-cyan-500" />
                    {t.bearing}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
