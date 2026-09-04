import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const mockChartData = [
  { time: '10:00', baseline: 120, adaptive: 35 },
  { time: '11:00', baseline: 120, adaptive: 42 },
  { time: '12:00', baseline: 120, adaptive: 58 },
  { time: '13:00', baseline: 120, adaptive: 50 },
  { time: '14:00', baseline: 120, adaptive: 65 },
  { time: '15:00', baseline: 120, adaptive: 48 },
];

export const BandwidthSavingsChart: React.FC = () => {
  return (
    <div className="p-4 bg-[#0f172a] rounded-xl border border-slate-800 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
          WAN Bandwidth Efficiency (Unmanaged vs Adaptive MB/s)
        </h4>
        <span className="text-[10px] font-mono text-emerald-400 font-bold">~64% WAN Bandwidth Saved</span>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={mockChartData}>
            <defs>
              <linearGradient id="baselineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="adaptiveGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px', fontFamily: 'monospace' }} />
            <Area type="monotone" dataKey="baseline" name="Unmanaged (Always 1080p)" stroke="#ef4444" fillOpacity={1} fill="url(#baselineGrad)" />
            <Area type="monotone" dataKey="adaptive" name="NetraBindu Adaptive" stroke="#10b981" fillOpacity={1} fill="url(#adaptiveGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
