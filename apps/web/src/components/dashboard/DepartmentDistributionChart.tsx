import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';
import { Building2 } from 'lucide-react';

const departmentData = [
  { name: 'Traffic Police', count: 18, color: '#06b6d4' },
  { name: 'CID Crime State Core', count: 12, color: '#3b82f6' },
  { name: 'Smart City Command', count: 10, color: '#10b981' },
  { name: 'State Highway Patrol', count: 6, color: '#f59e0b' },
  { name: 'Ports & Transport', count: 4, color: '#8b5cf6' },
];

export const DepartmentDistributionChart: React.FC = () => {
  return (
    <div className="glass-panel p-4 rounded-2xl space-y-3">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-500">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-slate-900 dark:text-white">
              26 Departments Federation
            </h3>
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
              Departmental Camera Allocation
            </span>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-cyan-500">50 Feeds</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={departmentData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={68}
                paddingAngle={4}
                dataKey="count"
              >
                {departmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '8px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="space-y-1.5 text-xs font-mono">
          {departmentData.map((d) => (
            <div key={d.name} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-slate-700 dark:text-slate-300 text-[11px] truncate max-w-[130px]">{d.name}</span>
              </div>
              <span className="font-bold text-slate-900 dark:text-white text-[11px]">{d.count} cams</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
