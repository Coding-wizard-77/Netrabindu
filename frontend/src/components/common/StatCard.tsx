import React from 'react';
import { clsx } from 'clsx';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  variant?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'blue' | 'violet';
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  variant = 'cyan',
  trend,
  onClick,
}) => {
  const variantStyles = {
    cyan: {
      border: 'border-cyan-500/30 hover:border-cyan-400/60',
      iconBg: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30',
      barBg: 'bg-cyan-500',
      glow: 'hover:shadow-glow-cyan/20',
      text: 'text-cyan-400',
    },
    emerald: {
      border: 'border-emerald-500/30 hover:border-emerald-400/60',
      iconBg: 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
      barBg: 'bg-emerald-500',
      glow: 'hover:shadow-glow-emerald/20',
      text: 'text-emerald-400',
    },
    amber: {
      border: 'border-amber-500/30 hover:border-amber-400/60',
      iconBg: 'bg-amber-500/15 text-amber-400 border border-amber-500/30',
      barBg: 'bg-amber-500',
      glow: 'hover:shadow-glow-amber/20',
      text: 'text-amber-400',
    },
    rose: {
      border: 'border-rose-500/30 hover:border-rose-400/60',
      iconBg: 'bg-rose-500/15 text-rose-400 border border-rose-500/30',
      barBg: 'bg-rose-500',
      glow: 'hover:shadow-glow-red/25',
      text: 'text-rose-400',
    },
    blue: {
      border: 'border-blue-500/30 hover:border-blue-400/60',
      iconBg: 'bg-blue-500/15 text-blue-400 border border-blue-500/30',
      barBg: 'bg-blue-500',
      glow: 'hover:shadow-glow-blue/20',
      text: 'text-blue-400',
    },
    violet: {
      border: 'border-violet-500/30 hover:border-violet-400/60',
      iconBg: 'bg-violet-500/15 text-violet-400 border border-violet-500/30',
      barBg: 'bg-violet-500',
      glow: 'hover:shadow-violet-500/20',
      text: 'text-violet-400',
    },
  }[variant];

  return (
    <div
      onClick={onClick}
      className={clsx(
        'relative overflow-hidden rounded-2xl glass-panel p-5 transition-all duration-300 group',
        variantStyles.border,
        variantStyles.glow,
        onClick && 'cursor-pointer hover:-translate-y-1'
      )}
    >
      {/* Top Accent Line */}
      <div className={clsx('absolute top-0 left-0 right-0 h-[3px] opacity-80', variantStyles.barBg)} />

      <div className="flex items-start justify-between">
        <div className="space-y-1.5 flex-1 pr-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <div className="text-2xl lg:text-3xl font-mono font-black tracking-tight text-white flex items-baseline gap-2">
            {value}
          </div>
        </div>

        {/* Glowing Icon Container */}
        <div
          className={clsx(
            'p-3 rounded-xl transition-transform duration-300 group-hover:scale-110 shadow-sm shrink-0',
            variantStyles.iconBg
          )}
        >
          {icon}
        </div>
      </div>

      {/* Subtitle & Trend */}
      {(subtitle || trend) && (
        <div className="mt-3.5 pt-3 border-t border-navy-800/80 flex items-center justify-between text-xs font-mono">
          {subtitle && (
            <span className="text-[11px] text-slate-400 truncate max-w-[200px]" title={subtitle}>
              {subtitle}
            </span>
          )}
          {trend && (
            <span
              className={clsx(
                'flex items-center gap-1 font-bold text-[11px] shrink-0 ml-auto',
                trend.isPositive ? 'text-emerald-400' : 'text-rose-400'
              )}
            >
              {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {trend.value}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
