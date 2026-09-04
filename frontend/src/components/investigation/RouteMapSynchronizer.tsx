import React from 'react';
import { VehicleRoutePoint } from '../../types';
import { CommandMap } from '../gis/CommandMap';

interface RouteMapSynchronizerProps {
  points: VehicleRoutePoint[];
  selectedPoint?: VehicleRoutePoint | null;
  onSelectPoint: (point: VehicleRoutePoint) => void;
}

export const RouteMapSynchronizer: React.FC<RouteMapSynchronizerProps> = ({
  points,
  selectedPoint,
  onSelectPoint,
}) => {
  const center = selectedPoint
    ? ([selectedPoint.location.lat, selectedPoint.location.lon] as [number, number])
    : points.length > 0
    ? ([points[0].location.lat, points[0].location.lon] as [number, number])
    : undefined;

  return (
    <div className="w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-slate-800 bg-[#090d16]">
      <CommandMap
        routePoints={points}
        center={center}
        zoom={selectedPoint ? 14 : 12}
        onSelectRoutePoint={onSelectPoint}
        className="w-full h-full min-h-[500px]"
      />
    </div>
  );
};
