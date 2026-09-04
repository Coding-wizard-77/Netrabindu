import React from 'react';
import { MapPin, AlertTriangle, ShieldCheck, Video } from 'lucide-react';
import { Badge } from '../common/Badge';

interface HotspotItem {
  id: string;
  name: string;
  department: string;
  activeAlerts: number;
  qualityState: 'Idle' | 'Normal' | 'Active' | 'Critical';
  fps: number;
  status: 'ONLINE' | 'DEGRADED';
}

const hotspots: HotspotItem[] = [
  { id: 'CAM-01', name: 'S.G. Highway Junction 04', department: 'Traffic Branch', activeAlerts: 3, qualityState: 'Critical', fps: 25, status: 'ONLINE' },
  { id: 'CAM-02', name: 'Iscon Crossroad North', department: 'Traffic Branch', activeAlerts: 2, qualityState: 'Active', fps: 20, status: 'ONLINE' },
  { id: 'CAM-04', name: 'Ahmedabad Railway Station Main', department: 'CID Crime', activeAlerts: 1, qualityState: 'Active', fps: 20, status: 'ONLINE' },
  { id: 'CAM-07', name: 'Gandhinagar Sector 11 Gate', department: 'Police HQ', activeAlerts: 0, qualityState: 'Normal', fps: 15, status: 'ONLINE' },
  { id: 'CAM-11', name: 'Surat Ring Road Toll Plaza', department: 'Highway Patrol', activeAlerts: 1, qualityState: 'Critical', fps: 25, status: 'ONLINE' },
];

export const IncidentHotspotMatrix: React.FC = () => {
  return (
    <div className="glass-panel p-4 rounded-2xl space-y-3">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-500">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 dark:text-white">
              Critical Surveillance Intersections
            </h3>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              High-Risk Hotspot Activity Matrix
            </span>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
          5 Monitored Zones
        </span>
      </div>

      <div className="space-y-2">
        {hotspots.map((item) => (
          <div
            key={item.id}
            className="p-2.5 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800/80 hover:border-cyan-500/40 transition-all flex items-center justify-between text-xs font-mono"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-cyan-600 dark:text-cyan-400">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{item.name}</span>
                  <span className="text-[10px] text-slate-400 font-normal">({item.id})</span>
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">{item.department}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="quality" value={item.qualityState} />
              {item.activeAlerts > 0 ? (
                <span className="px-2 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px] animate-pulse">
                  {item.activeAlerts} Alerts
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
                  Clear
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
