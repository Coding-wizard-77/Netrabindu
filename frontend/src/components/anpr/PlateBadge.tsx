import React from 'react';
import { formatLicensePlateDisplay } from '../../utils/normalizer';

interface PlateBadgeProps {
  plate: string;
  className?: string;
}

export const PlateBadge: React.FC<PlateBadgeProps> = ({ plate, className = '' }) => {
  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400 text-slate-950 font-mono font-black text-xs rounded border border-amber-500 shadow-sm tracking-widest uppercase select-none ${className}`}
    >
      <span className="text-[9px] px-1 py-0.2 bg-slate-950 text-amber-300 font-bold rounded">IND</span>
      <span>{formatLicensePlateDisplay(plate)}</span>
    </div>
  );
};
