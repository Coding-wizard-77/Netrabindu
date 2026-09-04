import React, { useState } from 'react';
import { Alert } from '../../types';
import { Drawer } from '../common/Drawer';
import { Badge } from '../common/Badge';
import { PlateBadge } from '../anpr/PlateBadge';
import { AlertActionButtons } from './AlertActionButtons';
import { formatToIST } from '../../utils/date';
import { EvidencePlayer } from '../video/EvidencePlayer';
import { VahanVehicleDossier } from '../police/VahanVehicleDossier';
import { Section65BCertificateModal } from '../police/Section65BCertificateModal';
import { NakabandiLockdownModal } from '../police/NakabandiLockdownModal';
import { MapPin, Shield, Clock, UserCheck, Radio, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';

interface AlertDetailDrawerProps {
  alert: Alert | null;
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge: (id: string, notes?: string) => Promise<void>;
  onDispatch: (id: string, unit: string, notes?: string) => Promise<void>;
  onResolve: (id: string, reason: string, isFalsePositive?: boolean) => Promise<void>;
}

export const AlertDetailDrawer: React.FC<AlertDetailDrawerProps> = ({
  alert,
  isOpen,
  onClose,
  onAcknowledge,
  onDispatch,
  onResolve,
}) => {
  const [dispatchUnit, setDispatchUnit] = useState('AHM-PCR-14 (S.G. Highway Interceptor)');
  const [operatorNotes, setOperatorNotes] = useState('Intercept suspect vehicle and verify driver credentials.');
  const [showDispatchForm, setShowDispatchForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [cert65BOpen, setCert65BOpen] = useState(false);
  const [nakabandiOpen, setNakabandiOpen] = useState(false);

  if (!alert) return null;

  const handleDispatchSubmit = async () => {
    if (!dispatchUnit.trim()) return;
    try {
      setActionLoading(true);
      await onDispatch(alert.id, dispatchUnit, operatorNotes);
      setShowDispatchForm(false);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Police Incident Dispatch & Intercept"
      subtitle={`Alert ID: ${alert.id}`}
      width="lg"
    >
      <div className="space-y-4 font-mono text-xs">
        {/* Status & Severity Bar */}
        <div className="p-3 bg-slate-900/70 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="severity" value={alert.severity} />
            <Badge variant="alertState" value={alert.state} />
          </div>
          <span className="text-xs font-mono text-slate-400">
            {formatToIST(alert.occurred_at)}
          </span>
        </div>

        {/* Quick Police Action Bar */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setNakabandiOpen(true)}
            className="p-2 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-400 hover:bg-rose-600/30 flex items-center justify-center gap-1.5 font-bold transition-colors"
          >
            <ShieldAlert className="w-4 h-4" />
            Trigger Nakabandi
          </button>
          <button
            onClick={() => setCert65BOpen(true)}
            className="p-2 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-600/30 flex items-center justify-center gap-1.5 font-bold transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            Sec 65B Certificate
          </button>
        </div>

        {/* Identification Match Breakdown */}
        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Watchlist Target Correlation
          </span>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 font-mono">Matched Feed Identifier:</span>
              <div>
                <PlateBadge plate={alert.detected_identifier} />
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 font-mono">Target Record:</span>
              <div className="text-sm font-bold text-white font-mono">{alert.target_identifier}</div>
              <div className="text-[10px] font-mono text-cyan-400">{alert.watchlist_category}</div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Correlation Confidence:</span>
            <span className="font-bold text-emerald-400">{(alert.confidence * 100).toFixed(1)}%</span>
          </div>
        </div>

        {/* VAHAN Vehicle Dossier */}
        <VahanVehicleDossier plate={alert.detected_identifier} isStolen={true} />

        {/* Camera & GIS Location */}
        <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <MapPin className="w-4 h-4 text-cyan-400" />
            {alert.camera_name} ({alert.camera_code})
          </div>
          <div className="text-slate-400">{alert.department_name}</div>
          <div className="font-mono text-[11px] text-slate-500">
            Lat: {alert.location.lat.toFixed(4)}, Lon: {alert.location.lon.toFixed(4)}
          </div>
        </div>

        {/* Evidence Video & Snapshot */}
        <EvidencePlayer evidence={alert.evidence} title="Incident Evidence" />

        {/* Dispatch Form Trigger */}
        {showDispatchForm ? (
          <div className="p-4 bg-slate-900 rounded-xl border border-cyan-500/40 space-y-3">
            <h5 className="text-xs font-bold text-white uppercase font-mono">Assign PCR Interceptor Unit</h5>
            <input
              type="text"
              placeholder="e.g. AHM-PCR-14 / Ahmedabad Traffic Zone 1"
              value={dispatchUnit}
              onChange={(e) => setDispatchUnit(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
            />
            <textarea
              placeholder="Operator instructions / response notes..."
              value={operatorNotes}
              onChange={(e) => setOperatorNotes(e.target.value)}
              rows={2}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono"
            />
            <div className="flex items-center gap-2 justify-end">
              <Button size="sm" variant="ghost" onClick={() => setShowDispatchForm(false)}>
                Cancel
              </Button>
              <Button size="sm" variant="primary" onClick={handleDispatchSubmit} loading={actionLoading}>
                Confirm PCR Dispatch
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Response Action:</span>
            <AlertActionButtons
              alert={alert}
              onAcknowledge={(id) => onAcknowledge(id)}
              onDispatch={() => setShowDispatchForm(true)}
              onResolve={(id) => onResolve(id, 'Resolved by Police Command')}
              onMarkFalsePositive={(id) => onResolve(id, 'Officer marked false positive', true)}
              loading={actionLoading}
            />
          </div>
        )}

        {/* Modals */}
        <Section65BCertificateModal
          isOpen={cert65BOpen}
          onClose={() => setCert65BOpen(false)}
          plateNumber={alert.detected_identifier}
        />
        <NakabandiLockdownModal
          isOpen={nakabandiOpen}
          onClose={() => setNakabandiOpen(false)}
          targetPlate={alert.detected_identifier}
        />
      </div>
    </Drawer>
  );
};
