import React from 'react';
import { Polyline, CircleMarker, Popup } from 'react-leaflet';
import { VehicleRoutePoint } from '../../types';
import { formatToIST } from '../../utils/date';
import { AlertCircle } from 'lucide-react';

interface RoutePolylineProps {
  points: VehicleRoutePoint[];
  onSelectPoint?: (point: VehicleRoutePoint) => void;
}

export const RoutePolyline: React.FC<RoutePolylineProps> = ({ points, onSelectPoint }) => {
  if (!points || points.length === 0) return null;

  const latLngs = points.map((p) => [p.location.lat, p.location.lon] as [number, number]);

  return (
    <>
      {/* Directional Polyline */}
      <Polyline
        positions={latLngs}
        pathOptions={{
          color: '#06b6d4',
          weight: 4,
          opacity: 0.85,
          dashArray: '8, 8',
        }}
      />

      {/* Ordered Waypoint Markers */}
      {points.map((pt, index) => {
        const isFirst = index === 0;
        const isLast = index === points.length - 1;
        const markerColor = isFirst ? '#10b981' : isLast ? '#ef4444' : '#06b6d4';

        return (
          <CircleMarker
            key={`${pt.event_id}-${index}`}
            center={[pt.location.lat, pt.location.lon]}
            radius={isFirst || isLast ? 9 : 7}
            pathOptions={{
              fillColor: markerColor,
              fillOpacity: 1,
              color: '#0f172a',
              weight: 2,
            }}
            eventHandlers={{
              click: () => onSelectPoint && onSelectPoint(pt),
            }}
          >
            <Popup>
              <div className="p-3 w-60 text-slate-100 font-sans">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800">
                  <span className="font-mono text-xs font-bold text-cyan-400">
                    Sighting #{pt.sequence}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {formatToIST(pt.occurred_at, 'HH:mm:ss')}
                  </span>
                </div>

                <div className="mt-2 text-xs space-y-1">
                  <div className="font-bold text-white font-mono">{pt.raw_plate}</div>
                  <div className="text-slate-300">{pt.camera_name}</div>
                  <div className="text-[11px] text-slate-400">{pt.department_name}</div>
                  <div className="text-[11px] font-mono text-emerald-400">
                    OCR Confidence: {(pt.confidence * 100).toFixed(1)}%
                  </div>
                </div>

                {pt.gap_warning_minutes && pt.gap_warning_minutes > 15 && (
                  <div className="mt-2 p-1.5 bg-amber-500/10 border border-amber-500/30 rounded text-[10px] text-amber-300 flex items-start gap-1">
                    <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                    <span>{pt.gap_warning_minutes} min unobserved gap before next sighting</span>
                  </div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
};
