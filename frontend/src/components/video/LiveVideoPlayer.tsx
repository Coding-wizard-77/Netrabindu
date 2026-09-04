import React, { useState, useRef } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  Camera as CameraIcon, 
  Eye, 
  Flame, 
  Zap, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  ZoomIn, 
  ZoomOut,
  Crosshair,
  Wifi,
  ShieldAlert
} from 'lucide-react';
import { Camera } from '../../types';
import { tacticalAudio } from '../../utils/audio';

export interface LiveVideoPlayerProps {
  camera?: Camera;
  streamUrl?: string;
  cameraName?: string;
  cameraId?: string;
  department?: string;
  fps?: number;
  bitrate?: string;
  detectedPlate?: string;
  confidence?: number;
  adaptiveMode?: 'idle' | 'motion' | 'critical';
  onSnapshot?: (dataUrl: string) => void;
}

export const LiveVideoPlayer: React.FC<LiveVideoPlayerProps> = ({
  camera,
  streamUrl,
  cameraName,
  cameraId,
  department = 'TRAFFIC_POLICE',
  fps = 25,
  bitrate = '2.4 Mbps',
  detectedPlate,
  confidence = 94.2,
  adaptiveMode = 'critical',
  onSnapshot,
}) => {
  const resolvedId = camera?.id || cameraId || 'CAM-001';
  const resolvedName = camera?.name || cameraName || 'Surveillance Node';
  const resolvedFps = camera?.fps || fps;
  const resolvedDept = (camera as any)?.department || camera?.department_id || department;

  const [filterMode, setFilterMode] = useState<'normal' | 'ir' | 'thermal'>('normal');
  const [isPTZOpen, setIsPTZOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCaptureSnapshot = () => {
    tacticalAudio.playKeyClick();
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createLinearGradient(0, 0, 1280, 720);
      grad.addColorStop(0, '#0a1128');
      grad.addColorStop(1, '#001f54');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1280, 720);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px monospace';
      ctx.fillText(`GUJARAT POLICE EVIDENCE SNAPSHOT | CAM: ${resolvedName} (${resolvedId})`, 40, 50);
      ctx.font = '16px monospace';
      ctx.fillText(`TIMESTAMP: ${new Date().toISOString()} | HASH: SHA-256 PENDING`, 40, 80);
      ctx.fillText(`DEPARTMENT: ${resolvedDept} | ADAPTIVE STATE: ${adaptiveMode.toUpperCase()}`, 40, 110);

      if (detectedPlate) {
        ctx.fillStyle = '#ffd166';
        ctx.font = 'bold 36px monospace';
        ctx.fillText(`TARGET PLATE: ${detectedPlate} (${confidence}% CONF)`, 40, 650);
      }

      const dataUrl = canvas.toDataURL('image/png');
      if (onSnapshot) {
        onSnapshot(dataUrl);
      } else {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `EVIDENCE_${resolvedId}_${Date.now()}.png`;
        a.click();
      }
    }
  };

  const toggleFullscreen = () => {
    tacticalAudio.playKeyClick();
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const getFilterStyle = () => {
    switch (filterMode) {
      case 'ir':
        return 'contrast-150 brightness-110 saturate-0 hue-rotate-90 sepia invert-[.15]';
      case 'thermal':
        return 'contrast-200 brightness-125 saturate-200 invert hue-rotate-180';
      default:
        return '';
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col overflow-hidden rounded-xl border border-navy-700 bg-black shadow-2xl ${
        isFullscreen ? 'h-screen w-screen rounded-none' : 'h-full min-h-[360px]'
      }`}
    >
      {/* Video Viewport */}
      <div className={`relative flex-1 bg-navy-950 flex items-center justify-center overflow-hidden ${getFilterStyle()}`}>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-30 z-10"></div>

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2 opacity-60">
            <Wifi className="h-12 w-12 text-accent-cyan mx-auto animate-pulse" />
            <div className="font-mono text-xs text-slate-400">
              RTSP/HLS LIVE FEED: {resolvedId}
            </div>
            <div className="font-mono text-[10px] text-accent-cyan">
              {resolvedFps} FPS | {bitrate} | 1080p60
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-20">
          <Crosshair className="h-48 w-48 text-accent-cyan" />
        </div>

        {/* Top Tactical HUD Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-auto">
          <div className="flex items-center space-x-2 bg-black/70 backdrop-blur-md rounded-lg px-2.5 py-1 border border-navy-700">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-ping"></span>
            <span className="font-mono text-xs font-bold text-white tracking-wider uppercase">
              LIVE: {resolvedName}
            </span>
            <span className="text-[10px] font-mono text-accent-cyan border-l border-navy-700 pl-2">
              {resolvedId}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
              adaptiveMode === 'critical'
                ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
            }`}>
              SENTINEL: {adaptiveMode}
            </span>
            <span className="bg-black/70 text-slate-300 font-mono text-[10px] px-2 py-0.5 rounded border border-navy-700">
              {resolvedFps} FPS
            </span>
          </div>
        </div>

        {/* ANPR Bounding Box Target */}
        {detectedPlate && (
          <div className="absolute bottom-16 left-8 z-20 animate-in fade-in zoom-in-95 duration-200">
            <div className="rounded border-2 border-red-500 bg-red-950/80 p-2 text-white shadow-lg backdrop-blur-md">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="h-4 w-4 text-red-400 animate-bounce" />
                <span className="font-mono text-sm font-black tracking-widest text-yellow-300">
                  {detectedPlate}
                </span>
                <span className="rounded bg-red-600 px-1.5 py-0.2 text-[9px] font-bold">
                  {confidence}% CONF
                </span>
              </div>
              <div className="mt-1 text-[9px] text-slate-300 font-mono">
                MATCH: GUJARAT POLICE HOTLIST #WL-904
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Tactical Controls Toolbar */}
      <div className="flex items-center justify-between border-t border-navy-800 bg-navy-950/90 px-3 py-2 z-20 backdrop-blur-md">
        <div className="flex items-center space-x-1">
          <button
            onClick={() => {
              tacticalAudio.playKeyClick();
              setFilterMode('normal');
            }}
            className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors ${
              filterMode === 'normal'
                ? 'bg-accent-blue text-white'
                : 'text-slate-400 hover:bg-navy-800 hover:text-slate-200'
            }`}
          >
            OPTICAL
          </button>
          <button
            onClick={() => {
              tacticalAudio.playKeyClick();
              setFilterMode('ir');
            }}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors ${
              filterMode === 'ir'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-400 hover:bg-navy-800 hover:text-slate-200'
            }`}
          >
            <Eye className="h-3 w-3" />
            <span>IR NIGHT</span>
          </button>
          <button
            onClick={() => {
              tacticalAudio.playKeyClick();
              setFilterMode('thermal');
            }}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded text-xs font-mono font-bold transition-colors ${
              filterMode === 'thermal'
                ? 'bg-amber-600 text-white'
                : 'text-slate-400 hover:bg-navy-800 hover:text-slate-200'
            }`}
          >
            <Flame className="h-3 w-3" />
            <span>THERMAL</span>
          </button>
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => {
              tacticalAudio.playKeyClick();
              setIsPTZOpen(!isPTZOpen);
            }}
            title="Toggle PTZ Camera Controls"
            className={`px-2 py-1 rounded border text-xs font-mono font-bold transition-colors ${
              isPTZOpen
                ? 'border-accent-cyan bg-accent-cyan/20 text-accent-cyan'
                : 'border-navy-700 bg-navy-900 text-slate-300 hover:bg-navy-800'
            }`}
          >
            PTZ
          </button>

          <button
            onClick={handleCaptureSnapshot}
            title="Capture Court-Admissible Evidence Snapshot"
            className="flex items-center space-x-1 px-2.5 py-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 text-xs font-semibold transition-colors"
          >
            <CameraIcon className="h-3.5 w-3.5 text-accent-cyan" />
            <span className="hidden sm:inline">SNAPSHOT</span>
          </button>

          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen Video"
            className="p-1 rounded bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 transition-colors"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Floating PTZ Controller Pad */}
      {isPTZOpen && (
        <div className="absolute right-4 bottom-14 z-30 rounded-xl border border-navy-700 bg-navy-900/95 p-3 shadow-2xl backdrop-blur-md w-44">
          <div className="flex items-center justify-between border-b border-navy-800 pb-1 mb-2">
            <span className="text-[10px] font-mono font-bold text-accent-cyan uppercase">
              PTZ CONTROLLER
            </span>
            <button
              onClick={() => setIsPTZOpen(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              ×
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1 place-items-center">
            <div></div>
            <button
              onClick={() => tacticalAudio.playKeyClick()}
              className="p-2 rounded bg-navy-800 hover:bg-navy-700 text-slate-200 active:scale-95"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <div></div>
            <button
              onClick={() => tacticalAudio.playKeyClick()}
              className="p-2 rounded bg-navy-800 hover:bg-navy-700 text-slate-200 active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="h-3 w-3 rounded-full bg-accent-blue/40 border border-accent-blue"></div>
            <button
              onClick={() => tacticalAudio.playKeyClick()}
              className="p-2 rounded bg-navy-800 hover:bg-navy-700 text-slate-200 active:scale-95"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
            <div></div>
            <button
              onClick={() => tacticalAudio.playKeyClick()}
              className="p-2 rounded bg-navy-800 hover:bg-navy-700 text-slate-200 active:scale-95"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
            <div></div>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-navy-800 pt-2">
            <button
              onClick={() => tacticalAudio.playKeyClick()}
              className="flex items-center space-x-1 px-2 py-1 rounded bg-navy-800 hover:bg-navy-700 text-[10px] font-mono text-slate-300"
            >
              <ZoomIn className="h-3 w-3" />
              <span>ZOOM+</span>
            </button>
            <button
              onClick={() => tacticalAudio.playKeyClick()}
              className="flex items-center space-x-1 px-2 py-1 rounded bg-navy-800 hover:bg-navy-700 text-[10px] font-mono text-slate-300"
            >
              <ZoomOut className="h-3 w-3" />
              <span>ZOOM-</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
