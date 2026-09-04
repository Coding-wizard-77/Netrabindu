import React from 'react';
import { clsx } from 'clsx';

interface PlateBadgeProps {
  plate: string;
  isCommercial?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const PlateBadge: React.FC<PlateBadgeProps> = ({
  plate,
  isCommercial = false,
  className,
  size = 'md',
}) => {
  const formattedPlate = plate.toUpperCase().replace(/\s+/g, ' ');

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3.5 py-1.5',
  }[size];

  return (
    <div
      className={clsx(
        isCommercial ? 'indian-plate-commercial' : 'indian-plate-private',
        sizeStyles,
        className
      )}
    >
      <div className="indian-plate-strip">
        <span>IND</span>
      </div>
      <span className="px-2 font-mono font-black">{formattedPlate}</span>
    </div>
  );
};
