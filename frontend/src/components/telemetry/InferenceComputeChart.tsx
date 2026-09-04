import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

const computeData = [
  { tier: 'Sentinel Motion', compute: 15 },
  { tier: 'Vehicle ROI', compute: 30 },
  { tier: 'Plate Localize', compute: 55 },
  { tier: 'OCR & Re-ID', compute: 85 },
];

export const InferenceComputeChart: React.FC = () => {
  return (
    <div className="p-4 bg-[#0f172a] rounded-xl border border-slate-800 space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
          Cascaded Inference Compute Escalation
        </h4>
        <span className="text-[10px] font-mono text-cyan-400 font-bold">Cascaded Task Models</span>
      </div>

      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={computeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="tier" stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis stroke="#64748b" tick={{ fontSize: 10, fill: '#64748b' }} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', fontSize: '11px', fontFamily: 'monospace' }} />
            <Bar dataKey="compute" name="GPU/CPU ms / Frame" fill="#06b6d4" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
