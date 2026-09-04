import React from 'react';
import { clsx } from 'clsx';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: 'cyan' | 'emerald' | 'amber' | 'rose' | 'slate';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'cyan',
  className,
}) => {
  const borderVariants = {
    cyan: 'border-cyan-200 dark:border-cyan-500/20 bg-white dark:bg-gradient-to-b dark:from-cyan-950/10 dark:to-slate-900/60 shadow-sm',
    emerald: 'border-emerald-200 dark:border-emerald-500/20 bg-white dark:bg-gradient-to-b dark:from-emerald-950/10 dark:to-slate-900/60 shadow-sm',
    amber: 'border-amber-200 dark:border-amber-500/20 bg-white dark:bg-gradient-to-b dark:from-amber-950/10 dark:to-slate-900/60 shadow-sm',
    rose: 'border-rose-200 dark:border-rose-500/20 bg-white dark:bg-gradient-to-b dark:from-rose-950/10 dark:to-slate-900/60 shadow-sm',
    slate: 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 shadow-sm',
  };

  const iconVariants = {
    cyan: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-800/40',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/40',
    amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40',
    rose: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/40',
    slate: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/40',
  };

  return (
    <div
      className={clsx(
        'relative overflow-hidden rounded-xl border p-4 backdrop-blur-md transition-all duration-200',
        borderVariants[variant],
        className
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">{title}</span>
        <div className={clsx('p-2 rounded-lg border', iconVariants[variant])}>{icon}</div>
      </div>

      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-mono">{value}</span>
        {trend && (
          <span
            className={clsx(
              'inline-flex items-center text-xs font-semibold',
              trend.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            )}
          >
            {trend.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 truncate">{subtitle}</p>}
    </div>
  );
};
