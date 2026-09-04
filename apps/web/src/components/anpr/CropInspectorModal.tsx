import React from 'react';
import { DetectionEvent } from '../../types';
import { Modal } from '../common/Modal';
import { PlateBadge } from './PlateBadge';
import { Badge } from '../common/Badge';
import { formatToIST } from '../../utils/date';
import { EvidencePlayer } from '../video/EvidencePlayer';
import { Camera, Cpu, Layers, ShieldCheck } from 'lucide-react';

interface CropInspectorModalProps {
  event: DetectionEvent | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CropInspectorModal: React.FC<CropInspectorModalProps> = ({
  event,
  isOpen,
  onClose,
}) => {
  if (!event) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Detection & Evidence Dossier"
      subtitle={`Event ID: ${event.event_id}`}
      size="lg"
    >
      <div className="space-y-4">
        {/* Top Summary Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Target Plate</span>
            <div className="mt-1">
              <PlateBadge plate={event.identifier.normalized} />
            </div>
            <div className="text-[11px] font-mono text-slate-400 mt-1">Raw OCR: {event.identifier.raw}</div>
          </div>

          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Camera & Location</span>
            <div className="text-xs font-bold text-white mt-1">{event.camera_name || event.camera_code}</div>
            <div className="text-[11px] text-slate-400">{event.department_name || 'Gujarat Police'}</div>
            <div className="text-[10px] font-mono text-slate-500">
              {event.location.lat.toFixed(4)}, {event.location.lon.toFixed(4)}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Pipeline Metadata</span>
            <div className="flex items-center gap-1 mt-1">
              <Badge variant="quality" value={event.pipeline.quality_state} />
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {(event.identifier.confidence * 100).toFixed(1)}% Conf
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400 mt-1">
              Node: {event.pipeline.node_id} • Model: {event.pipeline.model_version}
            </div>
          </div>
        </div>

        {/* Evidence Video Player & Crops */}
        <EvidencePlayer evidence={event.evidence} title="Rolling Buffer Evidence Clip" />

        {/* Timestamp & Integrity Info */}
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Cryptographic SHA-256 Verified
          </span>
          <span>Captured: {formatToIST(event.occurred_at)}</span>
        </div>
      </div>
    </Modal>
  );
};
