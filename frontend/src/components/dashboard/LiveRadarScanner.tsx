import React, { useState, useEffect } from 'react';
import { Radio, Shield, AlertTriangle, Crosshair, Zap } from 'lucide-react';

interface RadarBlip {
  id: string;
  label: string;
  region: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  type: 'ALERT' | 'DETECTION' | 'SENTINEL';
  confidence: number;
  time: string;
}

const mockBlips: RadarBlip[] = [
  { id: 'b1', label: 'GJ01AB1234', region: 'Ahmedabad S.G. Hwy', x: 62, y: 38, type: 'ALERT', confidence: 0.98, time: '1s ago' },
  { id: 'b2', label: 'GJ27C5678', region: 'Gandhinagar Sec 11', x: 45, y: 25, type: 'DETECTION', confidence: 0.95, time: '4s ago' },
  { id: 'b3', label: 'GJ05XY9901', region: 'Surat Ring Road', x: 70, y: 72, type: 'SENTINEL', confidence: 0.91, time: '12s ago' },
  { id: 'b4', label: 'GJ06K4412', region: 'Vadodara Alkapuri', x: 30, y: 60, type: 'DETECTION', confidence: 0.94, time: '8s ago' },
  { id: 'b5', label: 'GJ03Z1122', region: 'Rajkot Kalawad Rd', x: 20, y: 45, type: 'ALERT', confidence: 0.99, time: '2s ago' },
];

export const LiveRadarScanner: React.FC = () => {
  const [activeBlip, setActiveBlip] = useState<RadarBlip | null>(mockBlips[0]);
  const [sweepAngle, setSweepAngle] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSweepAngle((prev) => (prev + 2) % 360);
    }, 30);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between relative overflow-hidden">
      {/* Background Cyber Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between z-10 border-b border-slate-200 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 animate-pulse">
            <Crosshair className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              Live Sentinel Radar Sweep
            </h3>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              360° Real-Time Target Correlation Grid
            </span>
          </div>
        </div>

        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/30 flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
          SWEEP ACTIVE
        </span>
      </div>

      {/* Main Radar Screen */}
      <div className="my-4 flex flex-col md:flex-row items-center gap-6 justify-center z-10">
        {/* Radar Circular Scope */}
        <div className="relative w-56 h-56 rounded-full border-2 border-cyan-500/30 dark:border-cyan-500/40 bg-slate-950 flex items-center justify-center shadow-inner shadow-cyan-950/60 overflow-hidden">
          {/* Concentric Grid Rings */}
          <div className="absolute w-44 h-44 rounded-full border border-cyan-500/20" />
          <div className="absolute w-32 h-32 rounded-full border border-cyan-500/25" />
          <div className="absolute w-16 h-16 rounded-full border border-cyan-500/30" />

          {/* Crosshair Axes */}
          <div className="absolute w-full h-[1px] bg-cyan-500/25" />
          <div className="absolute h-full w-[1px] bg-cyan-500/25" />

          {/* Rotating Radar Sweep Cone */}
          <div
            className="absolute w-full h-full rounded-full origin-center pointer-events-none"
            style={{
              transform: `rotate(${sweepAngle}deg)`,
              background: 'conic-gradient(from 0deg, rgba(6, 182, 212, 0.45) 0deg, rgba(6, 182, 212, 0.0) 60deg, transparent 60deg)',
            }}
          />

          {/* Plotted Target Blips */}
          {mockBlips.map((blip) => {
            const isAlert = blip.type === 'ALERT';
            const isSelected = activeBlip?.id === blip.id;

            return (
              <button
                key={blip.id}
                onClick={() => setActiveBlip(blip)}
                style={{ left: `${blip.x}%`, top: `${blip.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer focus:outline-none"
                title={`${blip.label} (${blip.region})`}
              >
                <span className="relative flex h-3.5 w-3.5 items-center justify-center">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isAlert ? 'bg-rose-500' : 'bg-cyan-400'
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isAlert ? 'bg-rose-500' : 'bg-cyan-400'
                    } ${isSelected ? 'ring-2 ring-white scale-125' : ''}`}
                  />
                </span>
              </button>
            );
          })}
        </div>

        {/* Selected Blip Telemetry HUD */}
        <div className="flex-1 w-full space-y-2 font-mono text-xs">
          {activeBlip ? (
            <div className="p-3 bg-slate-900/90 dark:bg-[#070a13] rounded-xl border border-slate-700/80 dark:border-cyan-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-slate-400">Target Lock</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    activeBlip.type === 'ALERT'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  }`}
                >
                  {activeBlip.type}
                </span>
              </div>

              <div className="text-sm font-bold text-white tracking-wider flex items-center justify-between">
                <span>{activeBlip.label}</span>
                <span className="text-emerald-400 text-xs">{(activeBlip.confidence * 100).toFixed(1)}%</span>
              </div>

              <div className="text-[11px] text-slate-300">{activeBlip.region}</div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span>Detected: {activeBlip.time}</span>
                <span className="text-cyan-400">Sentinel Tier 3</span>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-slate-500 text-xs">Select a radar blip to inspect lock.</div>
          )}

          <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="p-2 bg-slate-900/40 dark:bg-slate-950/60 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-slate-500">ANGULAR VEL:</span>
              <span className="text-cyan-400 font-bold">120°/s</span>
            </div>
            <div className="p-2 bg-slate-900/40 dark:bg-slate-950/60 rounded-lg border border-slate-800 flex justify-between">
              <span className="text-slate-500">BLIP DENSITY:</span>
              <span className="text-emerald-400 font-bold">5 Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400">
        <span>GRID RANGE: 50 KM RADIUS</span>
        <span>LATENCY: 12ms</span>
      </div>
    </div>
  );
};
