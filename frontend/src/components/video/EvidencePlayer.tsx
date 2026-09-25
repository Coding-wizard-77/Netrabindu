import React, { useState } from 'react';
import { DetectionEvidence } from '../../types';
import { Download, Film, Camera, RefreshCw } from 'lucide-react';

interface EvidencePlayerProps {
  evidence: DetectionEvidence;
  cameraId?: string;
  cameraCode?: string;
  title?: string;
}

export const EvidencePlayer: React.FC<EvidencePlayerProps> = ({
  evidence,
  cameraId,
  cameraCode,
  title = 'Forensic Evidence Dossier',
}) => {
  const [videoError, setVideoError] = useState(false);
  const [plateError, setPlateError] = useState(false);
  const [vehicleError, setVehicleError] = useState(false);

  return (
    <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800 select-none">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 font-mono">
          <Film className="w-4 h-4 text-cyan-400" />
          {title}
        </h4>
        {evidence.clip_uri && (
          <a
            href={evidence.clip_uri}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1 bg-cyan-950/40 border border-cyan-500/30 px-2 py-1 rounded"
          >
            <Download className="w-3 h-3" /> Download MP4
          </a>
        )}
      </div>

      {/* Video Viewer - Strictly Stored Forensic Video */}
      <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-black aspect-video flex items-center justify-center">
        {evidence.clip_uri && !videoError ? (
          <>
            <video
              key={evidence.clip_uri}
              src={evidence.clip_uri}
              controls
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onError={() => setVideoError(true)}
              className="w-full h-full object-contain"
            />
            {/* Stored Evidence Forensic Overlay Badge */}
            <div className="absolute top-2 left-2 pointer-events-none flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono text-emerald-400 border border-emerald-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              STORED EVIDENCE ARCHIVE
            </div>
            <div className="absolute top-2 right-2 pointer-events-none px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[9px] font-mono text-slate-400 border border-slate-700">
              H.264 MP4 • SEC-65B
            </div>
          </>
        ) : (
          /* Stored Buffer Compilation / Retry State (Never Fall Back to Live Stream) */
          <div className="relative w-full h-full flex flex-col items-center justify-center bg-slate-950 p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-full border-2 border-cyan-500/30 border-t-cyan-400 animate-spin flex items-center justify-center">
              <Film className="w-5 h-5 text-cyan-400/60" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-mono font-bold text-slate-300">
                FORENSIC EVIDENCE VAULT
              </div>
              <div className="text-[11px] font-mono text-slate-500 max-w-xs">
                Archival rolling buffer clip is being retrieved from persistent storage.
              </div>
            </div>
            {evidence.clip_uri && (
              <button
                type="button"
                onClick={() => setVideoError(false)}
                className="mt-2 text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1.5 bg-cyan-950/40 border border-cyan-500/40 px-3 py-1.5 rounded-md hover:bg-cyan-900/40 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reload Stored Video
              </button>
            )}
          </div>
        )}
      </div>

      {/* Forensic Visual Crops */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Plate Crop */}
        <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 block mb-1 font-bold">Plate Crop</span>
          <div className="h-20 w-full flex items-center justify-center bg-black rounded overflow-hidden">
            {evidence.plate_crop_uri && !plateError ? (
              <img
                src={evidence.plate_crop_uri}
                alt="Plate crop"
                onError={() => setPlateError(true)}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="text-[10px] font-mono text-cyan-400 font-bold p-2 text-center border border-cyan-500/30 rounded bg-cyan-950/20 w-full h-full flex items-center justify-center">
                ANPR OPTICAL LOCK
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Context */}
        <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
          <span className="text-[10px] font-mono text-slate-400 block mb-1 font-bold">Vehicle Context</span>
          <div className="h-20 w-full flex items-center justify-center bg-black rounded overflow-hidden">
            {evidence.vehicle_crop_uri && !vehicleError ? (
              <img
                src={evidence.vehicle_crop_uri}
                alt="Vehicle context"
                onError={() => setVehicleError(true)}
                className="h-full w-full object-contain"
              />
            ) : (
              <div className="text-[10px] font-mono text-slate-400 p-2 text-center border border-slate-800 rounded bg-slate-900 w-full h-full flex items-center justify-center">
                LANE CORRIDOR CONTEXT
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
