import React, { useState } from 'react';
import { Camera, QualityState } from '../../types';
import { AdaptiveStateIndicator } from './AdaptiveStateIndicator';
import { Eye, Shield, Crosshair, Sparkles, Volume2, Camera as CameraIcon, Maximize2 } from 'lucide-react';

interface TacticalAIOverlayProps {
  camera: Camera;
  onSnapshot?: () => void;
  onFullscreen?: () => void;
  visionMode?: 'normal' | 'night' | 'thermal';
  onChangeVisionMode?: (mode: 'normal' | 'night' | 'thermal') => void;
}

export const TacticalAIOverlay: React.FC<TacticalAIOverlayProps> = ({
  camera,
  onSnapshot,
  onFullscreen,
  visionMode = 'normal',
  onChangeVisionMode,
}) => {
  const [showBoxes, setShowBoxes] = useState(true);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 z-20">
      {/* Top HUD Bar */}
      <div className="flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 bg-[#070a13]/85 backdrop-blur-md px-3 py-1.5 rounded-xl border border-cyan-500/30 text-xs font-mono text-white shadow-lg shadow-cyan-950/40">
          <span className="font-bold text-cyan-400">{camera.camera_code}</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-200 truncate max-w-[150px] font-semibold">{camera.name}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Vision Filter Switcher */}
          <div className="hidden sm:flex items-center gap-1 bg-[#070a13]/85 p-1 rounded-xl border border-slate-800 text-[10px] font-mono pointer-events-auto">
            <button
              onClick={() => onChangeVisionMode && onChangeVisionMode('normal')}
              className={`px-2 py-0.5 rounded ${visionMode === 'normal' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              NORM
            </button>
            <button
              onClick={() => onChangeVisionMode && onChangeVisionMode('night')}
              className={`px-2 py-0.5 rounded ${visionMode === 'night' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              IR-NV
            </button>
            <button
              onClick={() => onChangeVisionMode && onChangeVisionMode('thermal')}
              className={`px-2 py-0.5 rounded ${visionMode === 'thermal' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              THERM
            </button>
          </div>

          <AdaptiveStateIndicator
            state={camera.current_quality_state}
            fps={camera.fps}
            bitrateKbps={camera.bitrate_kbps}
          />
        </div>
      </div>

      {/* Center Tactical Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
        <div className="relative w-16 h-16 border border-cyan-500/40 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-cyan-400" />
          <div className="absolute w-8 h-[1px] bg-cyan-500/60" />
          <div className="absolute h-8 w-[1px] bg-cyan-500/60" />
        </div>
      </div>

      {/* Simulated AI Object Detection Bounding Box */}
      {showBoxes && (camera.current_quality_state === 'Active' || camera.current_quality_state === 'Critical') && (
        <div className="absolute top-[35%] left-[25%] w-[42%] h-[45%] border-2 border-emerald-400/90 rounded bg-emerald-500/5 pointer-events-none animate-in fade-in duration-300">
          <div className="absolute -top-6 left-0 bg-emerald-600 text-slate-950 font-mono text-[9px] font-black px-1.5 py-0.5 rounded flex items-center gap-1 shadow">
            <span>VEHICLE: SEDAN [98.4%]</span>
          </div>

          {/* Plate Box */}
          <div className="absolute bottom-2 left-4 w-28 h-8 border-2 border-amber-400 rounded bg-amber-400/20">
            <div className="absolute -top-5 left-0 bg-amber-400 text-slate-950 font-mono text-[8px] font-black px-1 rounded">
              OCR: GJ01AB1234 [99.2%]
            </div>
          </div>
        </div>
      )}

      {/* Bottom HUD Bar */}
      <div className="flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 bg-black/70 px-2 py-1 rounded-lg border border-slate-800">
          <span className="text-cyan-400 font-bold">{camera.department_name || 'Gujarat Police'}</span>
          <span>•</span>
          <span>LAT: {camera.location.lat.toFixed(4)} LON: {camera.location.lon.toFixed(4)}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowBoxes(!showBoxes)}
            className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1 transition-colors ${
              showBoxes
                ? 'bg-cyan-600/30 border-cyan-500 text-cyan-300'
                : 'bg-black/70 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Toggle AI Bounding Boxes"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="text-[10px] hidden sm:inline">AI HUD</span>
          </button>

          {onSnapshot && (
            <button
              onClick={onSnapshot}
              className="p-1.5 rounded-lg bg-black/70 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Capture Snapshot"
            >
              <CameraIcon className="w-3.5 h-3.5" />
            </button>
          )}

          {onFullscreen && (
            <button
              onClick={onFullscreen}
              className="p-1.5 rounded-lg bg-black/70 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
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
