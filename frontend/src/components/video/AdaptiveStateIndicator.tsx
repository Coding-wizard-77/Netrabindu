import React from 'react';
import { QualityState } from '../../types';
import { Badge } from '../common/Badge';
import { Activity, ShieldAlert, Cpu } from 'lucide-react';

interface AdaptiveStateIndicatorProps {
  state?: QualityState;
  reason?: string;
  fps?: number;
  bitrateKbps?: number;
  resolution?: string;
}

export const AdaptiveStateIndicator: React.FC<AdaptiveStateIndicatorProps> = ({
  state = 'Normal',
  reason = 'Sentinel Scene Analysis',
  fps = 15,
  bitrateKbps = 1500,
  resolution = '1080p',
}) => {
  return (
    <div className="flex items-center gap-2 bg-[#0a0e1a]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300">
      <Badge variant="quality" value={state} pulse={state === 'Critical' || state === 'Active'} />
      <span className="hidden sm:inline text-slate-400">|</span>
      <span className="hidden sm:inline text-slate-400 truncate max-w-[120px]">{reason}</span>
      <span className="hidden md:inline text-slate-400">|</span>
      <span className="hidden md:inline text-cyan-300 font-bold">{resolution} @ {fps}fps</span>
      <span className="hidden lg:inline text-slate-400 font-bold">{(bitrateKbps / 1000).toFixed(1)} Mbps</span>
    </div>
  );
};
