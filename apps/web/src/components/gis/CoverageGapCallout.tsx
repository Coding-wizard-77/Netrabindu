import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface CoverageGapCalloutProps {
  fromCamera: string;
  toCamera: string;
  gapMinutes: number;
}

export const CoverageGapCallout: React.FC<CoverageGapCalloutProps> = ({
  fromCamera,
  toCamera,
  gapMinutes,
}) => {
  return (
    <div className="p-2.5 rounded-lg border border-amber-500/30 bg-amber-950/20 text-amber-300 text-xs flex items-center gap-2 font-mono">
      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
      <span>
        <strong>{gapMinutes}m Unobserved Interval:</strong> Gap between {fromCamera} and {toCamera}. No road interpolation inferred.
      </span>
    </div>
  );
};
