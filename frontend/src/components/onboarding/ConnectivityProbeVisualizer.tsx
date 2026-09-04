import React from 'react';
import { CameraValidationResult } from '../../types';
import { CheckCircle, XCircle, Activity, Film } from 'lucide-react';

interface ConnectivityProbeVisualizerProps {
  result: CameraValidationResult | null;
  loading?: boolean;
}

export const ConnectivityProbeVisualizer: React.FC<ConnectivityProbeVisualizerProps> = ({
  result,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center gap-3 text-xs font-mono text-cyan-400">
        <Activity className="w-4 h-4 animate-spin" />
        <span>Executing ffprobe & MediaMTX stream handshake test...</span>
      </div>
    );
  }

  if (!result) return null;

  return (
    <div
      className={`p-4 rounded-xl border ${
        result.status === 'SUCCESS'
          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
          : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
      } text-xs font-mono space-y-2`}
    >
      <div className="flex items-center gap-2 font-bold text-sm">
        {result.status === 'SUCCESS' ? (
          <>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Feed Probed & Validated Successfully</span>
          </>
        ) : (
          <>
            <XCircle className="w-4 h-4 text-rose-400" />
            <span>Stream Validation Failed</span>
          </>
        )}
      </div>

      {result.status === 'SUCCESS' ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-500/20 text-[11px]">
          <div>Codec: <strong className="text-white">{result.codec || 'H.264'}</strong></div>
          <div>Resolution: <strong className="text-white">{result.resolution || '1920x1080'}</strong></div>
          <div>FPS: <strong className="text-white">{result.fps || 25}</strong></div>
          <div>Probe Latency: <strong className="text-white">{result.probe_latency_ms || 120}ms</strong></div>
        </div>
      ) : (
        <div className="pt-2 border-t border-rose-500/20 text-rose-200">
          Reason: {result.error || 'Connection timed out or invalid RTSP authentication'}
        </div>
      )}
    </div>
  );
};
