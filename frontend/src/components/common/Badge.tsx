import React from 'react';
import { clsx } from 'clsx';
import { QualityState, CameraStatus, AlertSeverity, AlertState } from '../../types';

interface BadgeProps {
  variant?: 'status' | 'quality' | 'severity' | 'alertState' | 'default' | 'outline';
  value?: CameraStatus | QualityState | AlertSeverity | AlertState | string;
  className?: string;
  children?: React.ReactNode;
  pulse?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  value,
  className,
  children,
  pulse = false,
}) => {
  const content = children || value;

  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  if (variant === 'status') {
    switch (value) {
      case 'ONLINE':
        colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
        break;
      case 'DEGRADED':
        colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
        break;
      case 'OFFLINE':
        colorClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
        break;
      case 'TESTING':
        colorClasses = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
        break;
      default:
        colorClasses = 'bg-slate-800 text-slate-400 border-slate-700';
    }
  } else if (variant === 'quality') {
    switch (value) {
      case 'Idle':
        colorClasses = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30';
        break;
      case 'Normal':
        colorClasses = 'bg-blue-500/10 text-blue-400 border-blue-500/30';
        break;
      case 'Active':
        colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
        break;
      case 'Critical':
        colorClasses = 'bg-rose-500/15 text-rose-400 border-rose-500/40 shadow-sm shadow-rose-900/40';
        break;
    }
  } else if (variant === 'severity') {
    switch (value) {
      case 'CRITICAL':
        colorClasses = 'bg-rose-600 text-white border-rose-500 font-bold';
        break;
      case 'HIGH':
        colorClasses = 'bg-orange-500/20 text-orange-400 border-orange-500/40';
        break;
      case 'MEDIUM':
        colorClasses = 'bg-amber-500/20 text-amber-400 border-amber-500/40';
        break;
      case 'LOW':
        colorClasses = 'bg-blue-500/20 text-blue-400 border-blue-500/40';
        break;
    }
  } else if (variant === 'alertState') {
    switch (value) {
      case 'NEW':
        colorClasses = 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse';
        break;
      case 'ACKNOWLEDGED':
        colorClasses = 'bg-amber-500/20 text-amber-300 border-amber-500/40';
        break;
      case 'DISPATCHED':
        colorClasses = 'bg-blue-500/20 text-blue-300 border-blue-500/40';
        break;
      case 'RESOLVED':
        colorClasses = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
        break;
      case 'FALSE_POSITIVE':
        colorClasses = 'bg-slate-800 text-slate-400 border-slate-700';
        break;
    }
  }

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border font-mono tracking-tight transition-colors',
        colorClasses,
        className
      )}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current"></span>
        </span>
      )}
      {content}
    </span>
  );
};
