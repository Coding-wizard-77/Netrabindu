import React from 'react';
import { Menu, LogOut, Shield, Sun, Moon, Radio, PhoneCall } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useUIStore } from '../../store/useUIStore';
import { NotificationBell } from './NotificationBell';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { toggleSidebar, theme, toggleTheme } = useUIStore();

  return (
    <header className="h-14 bg-white dark:bg-[#0c121e] border-b border-slate-200 dark:border-slate-800 px-4 flex items-center justify-between z-30 transition-colors">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-blue-900/20 border border-blue-600/40 flex items-center justify-center text-blue-600 dark:text-cyan-400 shadow-sm">
            <Shield className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black tracking-wider text-slate-900 dark:text-white font-mono uppercase">
                GUJARAT POLICE <span className="text-cyan-600 dark:text-cyan-400">NETRABINDU</span>
              </span>
              <span className="hidden xl:inline text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30">
                સેવા • સુરક્ષા • શાંતિ
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 hidden sm:block">
              Integrated CCTV Command &amp; Investigation Grid
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Emergency Helpline Hotline */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-500 font-mono text-xs font-bold">
          <PhoneCall className="w-3.5 h-3.5 animate-pulse" />
          <span>POLICE CONTROL: 112 / 100</span>
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-200" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700 animate-in spin-in-180 duration-200" />
          )}
        </button>

        <NotificationBell />

        {/* Duty Officer Badge */}
        {user && (
          <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900 dark:text-slate-200">{user.username}</div>
              <div className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">{user.department_name || user.role}</div>
            </div>

            <button
              onClick={logout}
              className="p-2 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Logout Session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
