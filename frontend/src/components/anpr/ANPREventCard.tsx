import React from 'react';
import { DetectionEvent } from '../../types';
import { PlateBadge } from './PlateBadge';
import { Badge } from '../common/Badge';
import { formatToIST } from '../../utils/date';
import { Camera, Clock, Zap, Maximize2, Shield } from 'lucide-react';

interface ANPREventCardProps {
  event: DetectionEvent;
  onInspect?: (event: DetectionEvent) => void;
}

export const ANPREventCard: React.FC<ANPREventCardProps> = ({ event, onInspect }) => {
  const confidencePercent = (event.identifier.confidence * 100).toFixed(1);

  return (
    <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 hover:border-cyan-500/50 rounded-xl p-3.5 transition-all duration-200 shadow-sm hover:shadow-cyan-950/30 flex flex-col justify-between gap-3 group">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
          <Camera className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
          <span className="font-bold text-slate-800 dark:text-slate-200">{event.camera_code || 'CAM-01'}</span>
        </div>
        <Badge variant="quality" value={event.pipeline.quality_state} />
      </div>

      {/* Plate & Confidence */}
      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-800/80">
        <PlateBadge plate={event.identifier.normalized || event.identifier.raw} />
        <div className="text-right font-mono">
          <div className="text-[10px] text-slate-500">OCR CONFIDENCE</div>
          <div className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{confidencePercent}%</div>
        </div>
      </div>

      {/* Visual Crop Preview */}
      <div className="grid grid-cols-2 gap-2 h-20">
        <div className="relative rounded overflow-hidden bg-slate-100 dark:bg-black border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          {event.evidence.plate_crop_uri ? (
            <img src={event.evidence.plate_crop_uri} alt="Plate Crop" className="w-full h-full object-contain" />
          ) : (
            <span className="text-[9px] font-mono text-slate-400 dark:text-slate-600">Plate Crop</span>
          )}
        </div>
        <div className="relative rounded overflow-hidden bg-slate-100 dark:bg-black border border-slate-200 dark:border-slate-800 flex items-center justify-center">
          {event.evidence.vehicle_crop_uri ? (
            <img src={event.evidence.vehicle_crop_uri} alt="Vehicle Crop" className="w-full h-full object-contain" />
          ) : (
            <span className="text-[9px] font-mono text-slate-400 dark:text-slate-600">Vehicle Crop</span>
          )}
        </div>
      </div>

      {/* Metadata Footer */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400 dark:text-slate-500" />
          {formatToIST(event.occurred_at, 'HH:mm:ss')}
        </span>
        {onInspect && (
          <button
            onClick={() => onInspect(event)}
            className="text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-medium flex items-center gap-1 group-hover:underline"
          >
            Inspect <Maximize2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};
