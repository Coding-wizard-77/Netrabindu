import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Camera } from '../../types';
import { Badge } from '../common/Badge';
import { formatToIST } from '../../utils/date';
import { Video, Shield, Activity } from 'lucide-react';

interface CameraMarkerProps {
  camera: Camera;
  onSelectCamera?: (camera: Camera) => void;
  onOpenLiveStream?: (camera: Camera) => void;
}

export const CameraMarker: React.FC<CameraMarkerProps> = ({
  camera,
  onSelectCamera,
  onOpenLiveStream,
}) => {
  // Determine pin color based on status
  let pinColor = '#10b981'; // Online = Emerald
  let ringColor = '#06b6d4'; // Idle = Cyan

  if (camera.status === 'DEGRADED') pinColor = '#f59e0b';
  else if (camera.status === 'OFFLINE') pinColor = '#ef4444';
  else if (camera.status === 'UNKNOWN') pinColor = '#64748b';

  if (camera.current_quality_state === 'Normal') ringColor = '#3b82f6';
  else if (camera.current_quality_state === 'Active') ringColor = '#f59e0b';
  else if (camera.current_quality_state === 'Critical') ringColor = '#ef4444';

  const customIcon = L.divIcon({
    className: 'custom-camera-pin',
    html: `
      <div style="position: relative; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: ${pinColor}; opacity: 0.25; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: absolute; width: 22px; height: 22px; border-radius: 50%; border: 2px solid ${ringColor}; background: #0f172a; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.5);">
          <div style="width: 8px; height: 8px; border-radius: 50%; background: ${pinColor};"></div>
        </div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  return (
    <Marker
      position={[camera.location.lat, camera.location.lon]}
      icon={customIcon}
      eventHandlers={{
        click: () => onSelectCamera && onSelectCamera(camera),
      }}
    >
      <Popup>
        <div className="p-3 w-64 text-slate-100 font-sans">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-mono text-xs font-bold text-cyan-400">{camera.camera_code}</span>
            <Badge variant="status" value={camera.status} />
          </div>

          <div className="mt-2 space-y-1 text-xs">
            <div className="font-semibold text-slate-200">{camera.name}</div>
            <div className="text-[11px] text-slate-400">{camera.department_name || 'Gujarat Police'}</div>
            <div className="text-[11px] font-mono text-slate-400 truncate">{camera.address || 'Ahmedabad, Gujarat'}</div>
          </div>

          <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] font-mono">
            <div>
              <span className="text-slate-500">Profile:</span>{' '}
              <span className="text-cyan-300 font-semibold">{camera.analytics_profile}</span>
            </div>
            {camera.current_quality_state && (
              <Badge variant="quality" value={camera.current_quality_state} />
            )}
          </div>

          {onOpenLiveStream && (
            <button
              onClick={() => onOpenLiveStream(camera)}
              className="mt-3 w-full py-1.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Video className="w-3.5 h-3.5" />
              Open Live Stream
            </button>
          )}
        </div>
      </Popup>
    </Marker>
  );
};
