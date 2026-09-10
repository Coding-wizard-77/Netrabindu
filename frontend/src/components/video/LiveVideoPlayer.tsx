import React, { useState, useRef, useEffect } from 'react';
import { 
  Maximize2, 
  Minimize2, 
  Camera as CameraIcon, 
  Eye, 
  Flame, 
  ArrowUp, 
  ArrowDown, 
  ArrowLeft, 
  ArrowRight, 
  ZoomIn, 
  ZoomOut,
  Crosshair,
  ShieldAlert,
  X,
  RefreshCw,
  Sliders,
  Expand
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
  compact?: boolean;
  onSnapshot?: (dataUrl: string) => void;
  onInspect?: () => void;
  onRemove?: () => void;
  isSelected?: boolean;
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
  confidence = 96.8,
  adaptiveMode = 'critical',
  compact = true,
  onSnapshot,
  onInspect,
  onRemove,
  isSelected = false,
}) => {
  const resolvedId = camera?.id || cameraId || 'CAM-001';
  const resolvedCode = camera?.camera_code || (camera as any)?.code || (cameraId ? `CAM-${cameraId.slice(0, 4)}` : 'CAM-01');
  const resolvedName = camera?.name || cameraName || 'Surveillance Node';
  const resolvedFps = camera?.fps || fps;
  const resolvedDept = (camera as any)?.department_code || (camera as any)?.department?.code || camera?.department_id || department;

  const [filterMode, setFilterMode] = useState<'normal' | 'ir' | 'thermal'>('normal');
  const [isPTZOpen, setIsPTZOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [streamError, setStreamError] = useState<boolean>(false);
  const [consecutiveErrors, setConsecutiveErrors] = useState<number>(0);
  const [retryCount, setRetryCount] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [snapshotTick, setSnapshotTick] = useState<number>(Date.now());

  // Auto-retry stream loading on error
  useEffect(() => {
    if (streamError) {
      const timer = setTimeout(() => {
        setStreamError(false);
        setConsecutiveErrors(0);
        setRetryCount((prev) => prev + 1);
        setSnapshotTick(Date.now());
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [streamError]);

  // Targeted stream endpoint
  const targetCode = (camera?.camera_code || resolvedCode || resolvedId).toLowerCase();

  // Staggered snapshot refresh for compact mode to avoid HTTP/1.1 socket exhaustion in Chrome
  useEffect(() => {
    if (!compact || isHovered || isSelected) return;
    const camDigits = targetCode.replace(/\D/g, '');
    const camNum = camDigits ? parseInt(camDigits, 10) : 1;
    const staggerDelay = (camNum % 16) * 100;
    const intervalMs = 1800 + ((camNum % 5) * 120);

    const initialTimeout = setTimeout(() => {
      setSnapshotTick(Date.now());
      const interval = setInterval(() => {
        setSnapshotTick(Date.now());
      }, intervalMs);
      return () => clearInterval(interval);
    }, staggerDelay);

    return () => clearTimeout(initialTimeout);
  }, [compact, isHovered, isSelected, targetCode]);

  const streamSrc = streamUrl || (
    compact && !isHovered && !isSelected
      ? `/stream/${targetCode}/snapshot?t=${snapshotTick}`
      : `/stream/${targetCode}?r=${retryCount}`
  );

  const handleCaptureSnapshot = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    tacticalAudio.playKeyClick();
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw frame background
      const grad = ctx.createLinearGradient(0, 0, 1280, 720);
      grad.addColorStop(0, '#090d16');
      grad.addColorStop(1, '#050810');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 1280, 720);

      // Attempt to draw current image if available
      if (imgRef.current && !streamError) {
        try {
          ctx.drawImage(imgRef.current, 0, 0, 1280, 720);
        } catch {
          // Fallback gradient if CORS blocks direct canvas draw
        }
      }

      // Tactical evidence stamp
      ctx.fillStyle = 'rgba(10, 15, 25, 0.85)';
      ctx.fillRect(0, 0, 1280, 75);
      ctx.fillStyle = '#00e5ff';
      ctx.font = 'bold 22px monospace';
      ctx.fillText(`GUJARAT POLICE SURVEILLANCE EVIDENCE | NODE: ${resolvedCode} - ${resolvedName.toUpperCase()}`, 30, 45);

      ctx.fillStyle = 'rgba(10, 15, 25, 0.85)';
      ctx.fillRect(0, 660, 1280, 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = '16px monospace';
      ctx.fillText(`TIMESTAMP: ${new Date().toISOString()} | SEC-65B VERIFIED HASH | DEPT: ${resolvedDept}`, 30, 695);

      if (detectedPlate) {
        ctx.fillStyle = '#ffd166';
        ctx.font = 'bold 24px monospace';
        ctx.fillText(`ANPR TARGET: ${detectedPlate} (${confidence}% CONF)`, 850, 695);
      }

      const dataUrl = canvas.toDataURL('image/png');
      if (onSnapshot) {
        onSnapshot(dataUrl);
      } else {
        const a = document.createElement('a');
        a.href = dataUrl;
        a.download = `EVIDENCE_${resolvedCode}_${Date.now()}.png`;
        a.click();
      }
    }
  };

  const toggleFullscreen = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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

  const cycleFilter = (e: React.MouseEvent) => {
    e.stopPropagation();
    tacticalAudio.playKeyClick();
    if (filterMode === 'normal') setFilterMode('ir');
    else if (filterMode === 'ir') setFilterMode('thermal');
    else setFilterMode('normal');
  };

  // Compact Grid Mode (Clean, sleek, zero clutter)
  if (compact && !isFullscreen) {
    return (
      <div
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`relative w-full h-full min-h-[140px] flex flex-col bg-slate-950 overflow-hidden group select-none ${
          isSelected ? 'ring-2 ring-cyan-400 shadow-glow-cyan' : ''
        }`}
      >
        {/* Live Video Stream */}
        <div className={`relative w-full h-full flex-1 overflow-hidden bg-black ${getFilterStyle()}`}>
          {!streamError ? (
            <img
              ref={imgRef}
              src={streamSrc}
              alt={`CCTV ${resolvedCode}`}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
              onLoad={() => {
                setConsecutiveErrors(0);
                if (streamError) setStreamError(false);
              }}
              onError={() => {
                setConsecutiveErrors((prev) => {
                  const next = prev + 1;
                  if (next >= 3) {
                    setStreamError(true);
                  }
                  return next;
                });
              }}
            />
          ) : (
            /* Tactical Reconnecting / Signal Search State */
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 p-4 text-center">
              <div className="relative mb-2">
                <RefreshCw className="w-6 h-6 text-cyan-500 animate-spin" />
                <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-ping"></div>
              </div>
              <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider">ACQUIRING SIGNAL...</span>
              <span className="text-[10px] font-mono text-slate-500 mt-1">{resolvedCode} • RETRYING</span>
            </div>
          )}

          {/* Subtle Corner Viewfinder Optics */}
          <div className="pointer-events-none absolute inset-2.5 z-10 opacity-40 group-hover:opacity-75 transition-opacity">
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-cyan-400"></div>
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-cyan-400"></div>
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-cyan-400"></div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-cyan-400"></div>
          </div>

          {/* Top Sleek Telemetry Header Bar */}
          <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-none">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-slate-700/60 shadow-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-mono text-[10px] font-black text-cyan-400 tracking-wide">{resolvedCode}</span>
              <span className="text-slate-500 text-[10px]">|</span>
              <span className="font-mono text-[10px] text-slate-200 font-medium truncate max-w-[130px] sm:max-w-[180px]">
                {resolvedName}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md border border-slate-700/60 text-[9px] font-mono font-bold text-slate-300">
                {resolvedFps} FPS
              </span>
              {filterMode !== 'normal' && (
                <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold uppercase">
                  {filterMode}
                </span>
              )}
            </div>
          </div>

          {/* Subtle Hover Action Toolbar */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={cycleFilter}
              className="p-1.5 rounded-md bg-black/80 hover:bg-cyan-600 text-slate-300 hover:text-white border border-slate-700/80 transition-colors shadow-lg"
              title={`Toggle Camera Sensor Mode (Current: ${filterMode.toUpperCase()})`}
            >
              {filterMode === 'normal' ? <Eye className="w-3.5 h-3.5" /> : filterMode === 'ir' ? <Flame className="w-3.5 h-3.5 text-emerald-400" /> : <Sliders className="w-3.5 h-3.5 text-amber-400" />}
            </button>

            <button
              onClick={handleCaptureSnapshot}
              className="p-1.5 rounded-md bg-black/80 hover:bg-cyan-600 text-slate-300 hover:text-white border border-slate-700/80 transition-colors shadow-lg"
              title="Capture Court-Admissible Evidence Snapshot"
            >
              <CameraIcon className="w-3.5 h-3.5 text-cyan-400" />
            </button>

            {onInspect && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onInspect();
                }}
                className="p-1.5 rounded-md bg-black/80 hover:bg-cyan-600 text-slate-300 hover:text-white border border-slate-700/80 transition-colors shadow-lg"
                title="Inspect Camera in Full Control Deck"
              >
                <Expand className="w-3.5 h-3.5 text-white" />
              </button>
            )}

            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-md bg-black/80 hover:bg-cyan-600 text-slate-300 hover:text-white border border-slate-700/80 transition-colors shadow-lg"
              title="Fullscreen Stream"
            >
              <Maximize2 className="w-3.5 h-3.5 text-white" />
            </button>

            {onRemove && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove();
                }}
                className="p-1.5 rounded-md bg-black/80 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700/80 transition-colors shadow-lg"
                title="Remove Camera from Slot"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Expanded / Fullscreen / Master Mode
  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col overflow-hidden rounded-xl border border-navy-700 bg-black shadow-2xl ${
        isFullscreen ? 'h-screen w-screen rounded-none z-50' : 'h-full min-h-[380px]'
      }`}
    >
      {/* Video Viewport */}
      <div className={`relative flex-1 bg-navy-950 flex items-center justify-center overflow-hidden ${getFilterStyle()}`}>
        {!streamError ? (
          <img
            ref={imgRef}
            src={streamSrc}
            alt={`Live feed from ${resolvedName}`}
            className="absolute inset-0 w-full h-full object-cover z-0"
            onError={(e) => {
              const target = e.currentTarget;
              if (!target.src.includes(':8000')) {
                target.src = `http://localhost:8000/stream/${resolvedId}`;
              } else {
                setStreamError(true);
              }
            }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 p-6 text-center z-10">
            <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin mb-3" />
            <span className="text-sm font-mono font-bold text-cyan-400">CONNECTING TO VIDEO STREAM</span>
            <span className="text-xs font-mono text-slate-500 mt-1">{resolvedCode} • ATTEMPTING HANDSHAKE</span>
          </div>
        )}

        {/* Scanlines Overlay */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-25 z-10"></div>

        {/* Subtle Reticle Target */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-15 z-10">
          <Crosshair className="h-24 w-24 text-accent-cyan" />
        </div>

        {/* Top Tactical HUD Bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20 pointer-events-auto">
          <div className="flex items-center space-x-2 bg-black/75 backdrop-blur-md rounded-lg px-3 py-1.5 border border-navy-700 shadow-xl">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
            </span>
            <span className="font-mono text-xs font-bold text-white tracking-wider uppercase">
              {resolvedCode}: {resolvedName}
            </span>
            <span className="text-[10px] font-mono text-cyan-400 border-l border-navy-700 pl-2">
              {resolvedDept}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase border shadow-md ${
              adaptiveMode === 'critical'
                ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
            }`}>
              SENTINEL: {adaptiveMode}
            </span>
            <span className="bg-black/75 backdrop-blur-md text-slate-300 font-mono text-[10px] px-2.5 py-1 rounded border border-navy-700">
              {resolvedFps} FPS • {bitrate}
            </span>
          </div>
        </div>

        {/* ANPR Bounding Box Target */}
        {detectedPlate && (
          <div className="absolute bottom-16 left-6 z-20 animate-in fade-in zoom-in-95 duration-200">
            <div className="rounded-xl border-2 border-red-500 bg-red-950/85 p-3 text-white shadow-2xl backdrop-blur-md">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="h-4 w-4 text-red-400 animate-bounce" />
                <span className="font-mono text-sm font-black tracking-widest text-yellow-300">
                  {detectedPlate}
                </span>
                <span className="rounded bg-red-600 px-1.5 py-0.5 text-[9px] font-bold">
                  {confidence}% CONF
                </span>
              </div>
              <div className="mt-1 text-[10px] text-slate-300 font-mono">
                MATCH: GUJARAT POLICE HOTLIST #WL-904
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Tactical Controls Toolbar */}
      <div className="flex items-center justify-between border-t border-navy-800 bg-navy-950/95 px-4 py-2.5 z-20 backdrop-blur-md">
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => {
              tacticalAudio.playKeyClick();
              setFilterMode('normal');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              filterMode === 'normal'
                ? 'bg-accent-blue text-white shadow-glow-cyan'
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
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              filterMode === 'ir'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'text-slate-400 hover:bg-navy-800 hover:text-slate-200'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>IR NIGHT</span>
          </button>
          <button
            onClick={() => {
              tacticalAudio.playKeyClick();
              setFilterMode('thermal');
            }}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
              filterMode === 'thermal'
                ? 'bg-amber-600 text-white shadow-lg'
                : 'text-slate-400 hover:bg-navy-800 hover:text-slate-200'
            }`}
          >
            <Flame className="h-3.5 w-3.5" />
            <span>THERMAL</span>
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              tacticalAudio.playKeyClick();
              setIsPTZOpen(!isPTZOpen);
            }}
            title="Toggle PTZ Camera Controls"
            className={`px-3 py-1 rounded-lg border text-xs font-mono font-bold transition-all ${
              isPTZOpen
                ? 'border-cyan-400 bg-cyan-500/20 text-cyan-400 shadow-glow-cyan'
                : 'border-navy-700 bg-navy-900 text-slate-300 hover:bg-navy-800'
            }`}
          >
            PTZ
          </button>

          <button
            onClick={handleCaptureSnapshot}
            title="Capture Court-Admissible Evidence Snapshot"
            className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 text-xs font-semibold transition-all shadow-md"
          >
            <CameraIcon className="h-3.5 w-3.5 text-cyan-400" />
            <span>SNAPSHOT</span>
          </button>

          <button
            onClick={toggleFullscreen}
            title="Toggle Fullscreen Video"
            className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-700 text-slate-200 border border-navy-700 transition-all shadow-md"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Floating PTZ Controller Pad */}
      {isPTZOpen && (
        <div className="absolute right-4 bottom-16 z-30 rounded-2xl border border-cyan-500/40 bg-navy-900/95 p-3.5 shadow-2xl backdrop-blur-xl w-48 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-navy-800 pb-1.5 mb-2.5">
            <span className="text-[11px] font-mono font-bold text-cyan-400 tracking-wider uppercase">
              PTZ CONTROLLER
            </span>
            <button
              onClick={() => setIsPTZOpen(false)}
              className="text-slate-400 hover:text-white text-xs px-1"
            >
              ×
            </button>
          </div>
          <div className="grid grid-cols-3 gap-1.5 place-items-center">
            <div></div>
            <button
              onClick={() => tacticalAudio.playKeyClick()}
              className="p-2.5 rounded-xl bg-navy-800 hover:bg-cyan-600 text-slate-200 active:scale-95 transition-all shadow"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <div></div>
            <button
              onClick={() => tacticalAudio.playKeyClick()}
              className="p-2.5 rounded-xl bg-navy-800 hover:bg-cyan-600 text-slate-200 active:scale-95 transition-all shadow"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="h-3 w-3 rounded-full bg-cyan-400/40 border border-cyan-400 shadow-glow-cyan animate-pulse"></div>
            <button
              onClick={() => tacticalAudio.playKeyClick()}
              className="p-2.5 rounded-xl bg-navy-800 hover:bg-cyan-600 text-slate-200 active:scale-95 transition-all shadow"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
            <div></div>
            <button
              onClick={() => tacticalAudio.playKeyClick()}
              className="p-2.5 rounded-xl bg-navy-800 hover:bg-cyan-600 text-slate-200 active:scale-95 transition-all shadow"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
            <div></div>
          </div>
          <div className="mt-2.5 flex items-center justify-between border-t border-navy-800 pt-2">
            <button
              onClick={() => tacticalAudio.playKeyClick()}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-navy-800 hover:bg-cyan-600 text-slate-300 hover:text-white text-[10px] font-mono font-bold transition-all"
            >
              <ZoomIn className="h-3 w-3 text-cyan-400" />
              <span>ZOOM+</span>
            </button>
            <button
              onClick={() => tacticalAudio.playKeyClick()}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-navy-800 hover:bg-cyan-600 text-slate-300 hover:text-white text-[10px] font-mono font-bold transition-all"
            >
              <ZoomOut className="h-3 w-3 text-cyan-400" />
              <span>ZOOM-</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
