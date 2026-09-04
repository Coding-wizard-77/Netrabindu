import React from 'react';
import { VehicleRoutePoint } from '../../types';
import { formatToIST } from '../../utils/date';
import { CoverageGapCallout } from '../gis/CoverageGapCallout';
import { Camera, Clock, MapPin, Eye } from 'lucide-react';

interface VehicleTimelineProps {
  points: VehicleRoutePoint[];
  onSelectPoint: (point: VehicleRoutePoint) => void;
  selectedPoint?: VehicleRoutePoint | null;
}

export const VehicleTimeline: React.FC<VehicleTimelineProps> = ({
  points,
  onSelectPoint,
  selectedPoint,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between font-mono text-xs text-slate-400 pb-2 border-b border-slate-800">
        <span className="font-bold text-white uppercase tracking-wider">
          Chronological Sighting Timeline ({points.length} Sightings)
        </span>
        <span>Oldest &rarr; Newest</span>
      </div>

      <div className="relative border-l-2 border-slate-800 ml-4 space-y-6">
        {points.map((pt, idx) => {
          const isSelected = selectedPoint?.event_id === pt.event_id;
          const nextPt = points[idx + 1];

          return (
            <div key={pt.event_id || idx} className="relative pl-6 group">
              {/* Waypoint Dot */}
              <div
                className={`absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-2 ${
                  isSelected
                    ? 'bg-cyan-400 border-white shadow-md shadow-cyan-500/50'
                    : 'bg-slate-900 border-cyan-500 group-hover:bg-cyan-500'
                } transition-all flex items-center justify-center text-[8px] font-mono font-bold text-slate-900`}
              >
                {pt.sequence}
              </div>

              {/* Sighting Card */}
              <div
                onClick={() => onSelectPoint(pt)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-950/20 border-cyan-500/80 shadow-lg shadow-cyan-950/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/80">
                  <div className="font-mono text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    {pt.camera_name}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">
                    {formatToIST(pt.occurred_at, 'HH:mm:ss')}
                  </span>
                </div>

                <div className="mt-2 flex items-center justify-between text-xs font-mono">
                  <div className="text-slate-400">
                    {pt.department_name} • Lat: {pt.location.lat.toFixed(4)}, Lon: {pt.location.lon.toFixed(4)}
                  </div>
                  <span className="text-emerald-400 font-bold">
                    {(pt.confidence * 100).toFixed(1)}% OCR
                  </span>
                </div>

                {pt.thumbnail_uri && (
                  <div className="mt-2 h-16 w-32 bg-black rounded overflow-hidden border border-slate-800">
                    <img src={pt.thumbnail_uri} alt="Vehicle Sighting" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Explicit Gap Callout between sequential cameras */}
              {pt.gap_warning_minutes && pt.gap_warning_minutes > 15 && nextPt && (
                <div className="mt-3 ml-2">
                  <CoverageGapCallout
                    fromCamera={pt.camera_name}
                    toCamera={nextPt.camera_name}
                    gapMinutes={pt.gap_warning_minutes}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
