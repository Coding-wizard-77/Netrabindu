import React from 'react';
import { EdgeNodeTelemetry } from '../../types';
import { Badge } from '../common/Badge';
import { Cpu, Zap, Activity } from 'lucide-react';

interface AdaptiveStateMatrixProps {
  nodes: EdgeNodeTelemetry[];
}

export const AdaptiveStateMatrix: React.FC<AdaptiveStateMatrixProps> = ({ nodes }) => {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {nodes.map((node) => (
          <div
            key={node.node_id}
            className="p-4 bg-[#0f172a] rounded-xl border border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-mono text-xs font-bold text-white">{node.node_id}</h4>
                <p className="text-[10px] font-mono text-slate-400">{node.region}</p>
              </div>
              <Badge variant="status" value={node.status === 'HEALTHY' ? 'ONLINE' : 'DEGRADED'} />
            </div>

            {/* Quality State Distribution */}
            <div className="space-y-1 text-[11px] font-mono">
              <div className="flex justify-between text-slate-400">
                <span>Active Camera States:</span>
                <span className="text-white font-bold">{node.active_cameras} total</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-center font-bold pt-1">
                <div className="p-1.5 bg-cyan-950/40 border border-cyan-500/30 rounded text-cyan-300">
                  <div className="text-[9px] text-slate-400">IDLE</div>
                  {node.idle_cameras}
                </div>
                <div className="p-1.5 bg-blue-950/40 border border-blue-500/30 rounded text-blue-300">
                  <div className="text-[9px] text-slate-400">NORM</div>
                  {node.normal_cameras}
                </div>
                <div className="p-1.5 bg-amber-950/40 border border-amber-500/30 rounded text-amber-300">
                  <div className="text-[9px] text-slate-400">ACTV</div>
                  {node.active_cameras - node.idle_cameras - node.normal_cameras - node.critical_cameras}
                </div>
                <div className="p-1.5 bg-rose-950/40 border border-rose-500/30 rounded text-rose-300">
                  <div className="text-[9px] text-slate-400">CRIT</div>
                  {node.critical_cameras}
                </div>
              </div>
            </div>

            {/* Efficiency Metrics */}
            <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px] font-mono">
              <div>
                <span className="text-slate-500 block text-[9px]">BANDWIDTH SAVED</span>
                <span className="font-bold text-emerald-400">{node.bandwidth_saved_mbps} Mbps</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px]">COMPUTE SAVINGS</span>
                <span className="font-bold text-cyan-400">{node.compute_savings_percent}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
