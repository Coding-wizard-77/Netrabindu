import React from 'react';
import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Camera,
  Grid,
  Zap,
  Search,
  AlertTriangle,
  ListOrdered,
  Activity,
  FileText,
  Shield,
  Radio,
} from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

const navigationItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Camera Registry', path: '/cameras', icon: Camera },
  { name: 'Live Video Wall', path: '/live', icon: Grid },
  { name: 'AI Detections', path: '/events', icon: Zap },
  { name: 'Vehicle Investigation', path: '/investigation', icon: Search },
  { name: 'Alerts & Dispatch', path: '/alerts', icon: AlertTriangle },
  { name: 'Watchlists', path: '/watchlists', icon: ListOrdered },
  { name: 'Health & Telemetry', path: '/health', icon: Activity },
  { name: 'Audit Logs', path: '/audit', icon: FileText },
];

export const Sidebar: React.FC = () => {
  const { sidebarOpen } = useUIStore();

  return (
    <aside
      className={clsx(
        'bg-[#0a0e1a] border-r border-slate-800/80 flex flex-col transition-all duration-300 z-40',
        sidebarOpen ? 'w-64' : 'w-16'
      )}
    >
      {/* Brand Header */}
      <div className="h-14 px-4 flex items-center gap-3 border-b border-slate-800/80">
        <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 flex items-center justify-center shrink-0">
          <div className="w-full h-full bg-[#0a0e1a] rounded-[6px] flex items-center justify-center">
            <Radio className="w-4 h-4 text-cyan-400" />
          </div>
        </div>
        {sidebarOpen && (
          <div className="overflow-hidden">
            <div className="text-sm font-bold text-white tracking-tight">NETRABINDU</div>
            <div className="text-[10px] font-mono text-slate-400 truncate">Tactical GIS Center</div>
          </div>
        )}
      </div>

      {/* Nav List */}
      <nav className="p-2 space-y-1 flex-1 overflow-y-auto">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all group select-none',
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold shadow-sm shadow-cyan-950/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                )
              }
              title={!sidebarOpen ? item.name : undefined}
            >
              <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
              {sidebarOpen && <span>{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer System Status */}
      {sidebarOpen && (
        <div className="p-3 border-t border-slate-800/80 m-2 rounded-lg bg-slate-900/60 text-[11px] font-mono text-slate-400">
          <div className="flex items-center justify-between text-slate-300 font-semibold">
            <span>Adaptive Engine</span>
            <span className="text-emerald-400">OPTIMAL</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">Auto Bandwidth Scaling Active</div>
        </div>
      )}
    </aside>
  );
};
