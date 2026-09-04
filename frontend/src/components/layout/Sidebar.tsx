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
  ChevronLeft,
  ChevronRight,
  Cpu
} from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  pulse?: boolean;
  alertBadge?: boolean;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const navigationGroups: NavGroup[] = [
  {
    group: 'TACTICAL COMMAND',
    items: [
      { name: 'Command Dashboard', path: '/', icon: LayoutDashboard, badge: 'LIVE' },
      { name: 'Live Video Wall', path: '/live', icon: Grid, badge: '16x' },
      { name: 'AI ANPR Stream', path: '/events', icon: Zap, pulse: true },
      { name: 'Alerts & Hotlist', path: '/alerts', icon: AlertTriangle, alertBadge: true },
    ],
  },
  {
    group: 'FORENSICS & SURVEILLANCE',
    items: [
      { name: 'Vehicle Investigation', path: '/investigation', icon: Search },
      { name: 'Camera Registry', path: '/cameras', icon: Camera },
      { name: 'Red Notice Watchlists', path: '/watchlists', icon: ListOrdered },
    ],
  },
  {
    group: 'SYSTEM & GOVERNANCE',
    items: [
      { name: 'Health & GPU Telemetry', path: '/health', icon: Activity },
      { name: 'Sec 65B Audit Ledger', path: '/audit', icon: FileText },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <aside
      className={clsx(
        'bg-white dark:bg-navy-950/95 border-r border-slate-200 dark:border-navy-800 flex flex-col transition-all duration-300 z-40 relative backdrop-blur-xl select-none',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-200 dark:border-navy-800/80">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="relative h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-blue-600 to-emerald-500 p-0.5 flex items-center justify-center shrink-0 shadow-glow-cyan/20">
            <div className="w-full h-full bg-slate-50 dark:bg-navy-950 rounded-[10px] flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-500" />
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden leading-tight">
              <div className="text-sm font-black text-slate-900 dark:text-white tracking-wider font-mono">NETRABINDU</div>
              <div className="text-[10px] font-mono font-semibold text-cyan-600 dark:text-cyan-400 tracking-tight">
                GUJARAT POLICE GRID
              </div>
            </div>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-navy-850 transition-colors"
          title={sidebarOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav List */}
      <nav className="p-3 space-y-6 flex-1 overflow-y-auto">
        {navigationGroups.map((grp, gIdx) => (
          <div key={gIdx} className="space-y-1">
            {sidebarOpen && (
              <div className="px-3 text-[10px] font-mono font-bold tracking-widest text-slate-400 dark:text-slate-500 uppercase mb-2">
                {grp.group}
              </div>
            )}
            {grp.items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-mono font-medium transition-all group relative',
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 dark:border-cyan-500/40 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-navy-900/80 border border-transparent'
                    )
                  }
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110 text-cyan-600 dark:text-cyan-400/80 group-hover:text-cyan-500" />
                  {sidebarOpen && (
                    <div className="flex-1 flex items-center justify-between truncate">
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-100 text-cyan-700 border-slate-200 dark:bg-navy-800 dark:text-cyan-400 border dark:border-navy-700">
                          {item.badge}
                        </span>
                      )}
                      {item.pulse && (
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      )}
                      {item.alertBadge && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40 animate-pulse">
                          HOT
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer System Status */}
      {sidebarOpen ? (
        <div className="p-3 border-t border-slate-200 dark:border-navy-800 m-3 rounded-xl bg-slate-100/80 dark:bg-navy-900/60 text-[11px] font-mono text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-navy-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-200">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" /> Sentinel Engine
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">OPTIMAL</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-navy-950 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full w-[38%]" />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>GPU Load: 38%</span>
            <span>Bandwidth: -64%</span>
          </div>
        </div>
      ) : (
        <div className="p-3 border-t border-slate-200 dark:border-navy-800 flex justify-center">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
        </div>
      )}
    </aside>
  );
};
