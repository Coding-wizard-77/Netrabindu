import React from 'react';
import { EdgeNodeTelemetry } from '../../types';
import { Badge } from '../common/Badge';

export interface AdaptiveStateMatrixProps {
  nodes?: EdgeNodeTelemetry[];
}

export const AdaptiveStateMatrix: React.FC<AdaptiveStateMatrixProps> = ({ nodes }) => {
  const defaultNodes: EdgeNodeTelemetry[] = nodes || [
    {
      node_id: 'EDGE-NODE-AHMEDABAD-01',
      region: 'Ahmedabad Urban Ring (Zone 1-4)',
      status: 'HEALTHY',
      active_cameras: 48,
      idle_cameras: 32,
      normal_cameras: 10,
      critical_cameras: 6,
      bandwidth_saved_mbps: 184.2,
      compute_savings_percent: 68.4,
      sentinel_trigger_rate_per_min: 48,
      avg_inference_latency_ms: 14.8,
      quality_switches_last_hour: 29,
    },
    {
      node_id: 'EDGE-NODE-SURAT-02',
      region: 'Surat City & Industrial Diamond Corridor',
      status: 'HEALTHY',
      active_cameras: 36,
      idle_cameras: 24,
      normal_cameras: 8,
      critical_cameras: 4,
      bandwidth_saved_mbps: 142.0,
      compute_savings_percent: 64.0,
      sentinel_trigger_rate_per_min: 38,
      avg_inference_latency_ms: 15.2,
      quality_switches_last_hour: 22,
    },
    {
      node_id: 'EDGE-NODE-VADODARA-03',
      region: 'Vadodara Express Highway Junction',
      status: 'HEALTHY',
      active_cameras: 28,
      idle_cameras: 18,
      normal_cameras: 7,
      critical_cameras: 3,
      bandwidth_saved_mbps: 98.6,
      compute_savings_percent: 61.5,
      sentinel_trigger_rate_per_min: 26,
      avg_inference_latency_ms: 13.9,
      quality_switches_last_hour: 16,
    },
  ];

  return (
    <div className="glass-panel p-5 rounded-2xl border border-navy-700/80 shadow-2xl space-y-4">
      <div className="flex items-center justify-between border-b border-navy-800 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
          Multi-District Edge Inference Node Grid
        </h3>
        <span className="text-[10px] font-mono text-emerald-400 font-bold">3 ACTIVE NODES</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {defaultNodes.map((node) => (
          <div
            key={node.node_id}
            className="p-3.5 bg-navy-950/80 rounded-xl border border-navy-800 hover:border-cyan-500/40 transition-colors space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-mono text-xs font-bold text-white">{node.node_id}</h4>
                <p className="text-[10px] font-mono text-slate-400 truncate max-w-[150px]">{node.region}</p>
              </div>
              <Badge variant="status" value={node.status === 'HEALTHY' ? 'ONLINE' : 'DEGRADED'} />
            </div>

            <div className="space-y-1 text-[11px] font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Active Camera States:</span>
                <span className="text-white font-bold">{node.active_cameras} total</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-center font-bold pt-1">
                <div className="p-1 bg-cyan-950/60 border border-cyan-500/30 rounded text-cyan-300">
                  <div className="text-[8px] text-slate-400">IDLE</div>
                  {node.idle_cameras}
                </div>
                <div className="p-1 bg-blue-950/60 border border-blue-500/30 rounded text-blue-300">
                  <div className="text-[8px] text-slate-400">NORM</div>
                  {node.normal_cameras}
                </div>
                <div className="p-1 bg-amber-950/60 border border-amber-500/30 rounded text-amber-300">
                  <div className="text-[8px] text-slate-400">ACTV</div>
                  {node.active_cameras - node.idle_cameras - node.normal_cameras - node.critical_cameras}
                </div>
                <div className="p-1 bg-rose-950/60 border border-rose-500/30 rounded text-rose-300">
                  <div className="text-[8px] text-slate-400">CRIT</div>
                  {node.critical_cameras}
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-navy-800 grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div>
                <span className="text-slate-500 block text-[9px]">SAVED WAN</span>
                <span className="font-bold text-emerald-400">{node.bandwidth_saved_mbps} Mbps</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">COMPUTE SAVED</span>
                <span className="font-bold text-cyan-400">{node.compute_savings_percent}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
