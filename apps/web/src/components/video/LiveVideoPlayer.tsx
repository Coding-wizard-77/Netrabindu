import React, { useState, useEffect } from 'react';
import { Camera, StreamSessionResponse } from '../../types';
import { camerasApi } from '../../api/cameras';
import { WebRTCPlayer } from './WebRTCPlayer';
import { HLSPlayer } from './HLSPlayer';
import { TacticalAIOverlay } from './TacticalAIOverlay';
import { Loader2, VideoOff, RefreshCw } from 'lucide-react';

interface LiveVideoPlayerProps {
  camera: Camera;
  onSnapshotCapture?: (imageDataUrl: string) => void;
  className?: string;
}

export const LiveVideoPlayer: React.FC<LiveVideoPlayerProps> = ({
  camera,
  onSnapshotCapture,
  className = 'relative w-full h-full bg-slate-950 rounded-xl overflow-hidden border border-slate-800 group shadow-lg',
}) => {
  const [session, setSession] = useState<StreamSessionResponse | null>(null);
  const [useHls, setUseHls] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [visionMode, setVisionMode] = useState<'normal' | 'night' | 'thermal'>('normal');

  const fetchSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await camerasApi.getStreamSession(camera.id);
      setSession(res);
    } catch (err: any) {
      console.warn('Live stream session fetch failed:', err);
      setError(err.response?.data?.detail || 'Camera feed currently unavailable');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (camera.status !== 'OFFLINE') {
      fetchSession();
    } else {
      setLoading(false);
    }
  }, [camera.id, camera.status]);

  const visionFilterClass =
    visionMode === 'night'
      ? 'video-night-vision'
      : visionMode === 'thermal'
      ? 'video-thermal'
      : '';

  if (camera.status === 'OFFLINE') {
    return (
      <div className={`${className} flex flex-col items-center justify-center bg-[#070a13] text-slate-500 font-mono text-xs p-4 text-center`}>
        <VideoOff className="w-10 h-10 text-rose-500/60 mb-2" />
        <span className="font-bold text-rose-400">CAMERA OFFLINE</span>
        <span className="text-[11px] text-slate-400 mt-1 max-w-xs">
          {camera.failure_reason || 'Connection timeout to RTSP endpoint.'}
        </span>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`${className} flex flex-col items-center justify-center bg-[#070a13] font-mono text-xs text-slate-400`}>
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-2" />
        <span>Authorizing Stream Session...</span>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className={`${className} flex flex-col items-center justify-center bg-[#070a13] p-4 text-center font-mono text-xs text-slate-400`}>
        <VideoOff className="w-8 h-8 text-amber-500 mb-2" />
        <p className="text-slate-300 mb-2">{error || 'Stream not initialized'}</p>
        <button
          onClick={fetchSession}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded text-xs flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className={`w-full h-full transition-all duration-300 ${visionFilterClass}`}>
        {session.webrtc_url && !useHls ? (
          <WebRTCPlayer
            webrtcUrl={session.webrtc_url}
            sessionToken={session.session_token}
            onFallbackToHLS={() => setUseHls(true)}
          />
        ) : session.hls_url ? (
          <HLSPlayer src={session.hls_url} />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-950 text-xs font-mono text-slate-400">
            No browser-compatible stream available
          </div>
        )}
      </div>

      {/* Cyber Tactical HUD Overlay */}
      <TacticalAIOverlay
        camera={camera}
        visionMode={visionMode}
        onChangeVisionMode={(m) => setVisionMode(m)}
        onSnapshot={() => onSnapshotCapture && onSnapshotCapture('')}
      />
    </div>
  );
};
