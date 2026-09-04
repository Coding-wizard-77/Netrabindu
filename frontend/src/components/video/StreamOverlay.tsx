import React from 'react';
import { Camera, QualityState } from '../../types';
import { AdaptiveStateIndicator } from './AdaptiveStateIndicator';
import { Camera as CameraIcon, Maximize2, CameraOff } from 'lucide-react';

interface StreamOverlayProps {
  camera: Camera;
  onFullscreen?: () => void;
  onSnapshot?: () => void;
}

export const StreamOverlay: React.FC<StreamOverlayProps> = ({
  camera,
  onFullscreen,
  onSnapshot,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2.5 z-10">
      {/* Top Bar */}
      <div className="flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 bg-[#090d16]/80 backdrop-blur-md px-2 py-1 rounded border border-slate-800 text-xs font-mono text-white">
          <span className="font-bold text-cyan-400">{camera.camera_code}</span>
          <span className="text-slate-400 truncate max-w-[150px]">{camera.name}</span>
        </div>

        <AdaptiveStateIndicator
          state={camera.current_quality_state}
          fps={camera.fps}
          bitrateKbps={camera.bitrate_kbps}
        />
      </div>

      {/* Bottom Bar */}
      <div className="flex items-center justify-between pointer-events-auto">
        <span className="text-[10px] font-mono text-slate-400 bg-black/60 px-1.5 py-0.5 rounded">
          {camera.department_name || 'Gujarat Police'}
        </span>

        <div className="flex items-center gap-1">
          {onSnapshot && (
            <button
              onClick={onSnapshot}
              className="p-1 rounded bg-[#090d16]/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Capture Snapshot"
            >
              <CameraIcon className="w-3.5 h-3.5" />
            </button>
          )}
          {onFullscreen && (
            <button
              onClick={onFullscreen}
              className="p-1 rounded bg-[#090d16]/80 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
