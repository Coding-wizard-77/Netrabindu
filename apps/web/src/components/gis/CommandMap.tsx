import React from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { Camera, VehicleRoutePoint } from '../../types';
import { CameraMarker } from './CameraMarker';
import { RoutePolyline } from './RoutePolyline';
import { GUJARAT_CENTER } from '../../utils/geo';

interface CommandMapProps {
  cameras?: Camera[];
  routePoints?: VehicleRoutePoint[];
  center?: [number, number];
  zoom?: number;
  onSelectCamera?: (camera: Camera) => void;
  onOpenLiveStream?: (camera: Camera) => void;
  onSelectRoutePoint?: (point: VehicleRoutePoint) => void;
  className?: string;
}

export const CommandMap: React.FC<CommandMapProps> = ({
  cameras = [],
  routePoints = [],
  center = GUJARAT_CENTER,
  zoom = 12,
  onSelectCamera,
  onOpenLiveStream,
  onSelectRoutePoint,
  className = 'h-[500px] w-full rounded-xl overflow-hidden border border-slate-800',
}) => {
  return (
    <div className={className}>
      <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="h-full w-full">
        {/* Dark Matter CartoDB Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          maxZoom={19}
        />

        {/* Camera Pins */}
        {cameras.map((camera) => (
          <CameraMarker
            key={camera.id}
            camera={camera}
            onSelectCamera={onSelectCamera}
            onOpenLiveStream={onOpenLiveStream}
          />
        ))}

        {/* Vehicle Route & Gap Annotations */}
        {routePoints.length > 0 && (
          <RoutePolyline points={routePoints} onSelectPoint={onSelectRoutePoint} />
        )}
      </MapContainer>
    </div>
  );
};
