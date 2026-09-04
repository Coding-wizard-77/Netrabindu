import React from 'react';
import { DetectionEvidence } from '../../types';
import { Download, Film, Image as ImageIcon } from 'lucide-react';
import { Button } from '../common/Button';

interface EvidencePlayerProps {
  evidence: DetectionEvidence;
  title?: string;
}

export const EvidencePlayer: React.FC<EvidencePlayerProps> = ({ evidence, title = 'Detection Evidence' }) => {
  return (
    <div className="space-y-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
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
            className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
          >
            <Download className="w-3 h-3" /> Download MP4
          </a>
        )}
      </div>

      {/* Video / Thumbnail Viewer */}
      {evidence.clip_uri ? (
        <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-black aspect-video">
          <video src={evidence.clip_uri} controls className="w-full h-full object-contain" />
        </div>
      ) : evidence.thumbnail_uri ? (
        <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-black aspect-video flex items-center justify-center">
          <img src={evidence.thumbnail_uri} alt="Evidence thumbnail" className="w-full h-full object-contain" />
        </div>
      ) : (
        <div className="p-8 text-center text-xs font-mono text-slate-500 bg-slate-950 rounded-lg border border-slate-800">
          No media clip preserved for this event.
        </div>
      )}

      {/* Crops */}
      {(evidence.plate_crop_uri || evidence.vehicle_crop_uri) && (
        <div className="grid grid-cols-2 gap-3 pt-2">
          {evidence.plate_crop_uri && (
            <div className="p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block mb-1">Plate Crop</span>
              <img src={evidence.plate_crop_uri} alt="Plate crop" className="h-16 w-full object-contain bg-black rounded" />
            </div>
          )}
          {evidence.vehicle_crop_uri && (
            <div className="p-2 bg-slate-950 rounded border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 block mb-1">Vehicle Context</span>
              <img src={evidence.vehicle_crop_uri} alt="Vehicle crop" className="h-16 w-full object-contain bg-black rounded" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
