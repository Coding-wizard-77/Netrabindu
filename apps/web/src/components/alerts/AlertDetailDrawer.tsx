import React, { useState } from 'react';
import { Alert } from '../../types';
import { Drawer } from '../common/Drawer';
import { Badge } from '../common/Badge';
import { PlateBadge } from '../anpr/PlateBadge';
import { AlertActionButtons } from './AlertActionButtons';
import { formatToIST } from '../../utils/date';
import { EvidencePlayer } from '../video/EvidencePlayer';
import { MapPin, Shield, Clock, UserCheck, Radio } from 'lucide-react';
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
  const [dispatchUnit, setDispatchUnit] = useState('');
  const [operatorNotes, setOperatorNotes] = useState('');
  const [showDispatchForm, setShowDispatchForm] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

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
      title="Incident Response & Dispatch"
      subtitle={`Alert ID: ${alert.id}`}
      width="lg"
    >
      <div className="space-y-4">
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
            <h5 className="text-xs font-bold text-white uppercase font-mono">Assign Tactical Unit</h5>
            <input
              type="text"
              placeholder="e.g. Patrol Car 14 / Ahmedabad Traffic Zone 1"
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
                Confirm Dispatch
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
              onResolve={(id) => onResolve(id, 'Resolved by Command Center')}
              onMarkFalsePositive={(id) => onResolve(id, 'Operator marked false positive', true)}
              loading={actionLoading}
            />
          </div>
        )}
      </div>
    </Drawer>
  );
};
