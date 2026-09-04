import React, { useState, useEffect } from 'react';
import { Alert, AlertState, AlertSeverity } from '../types';
import { alertsApi } from '../api/alerts';
import { AlertTable } from '../components/alerts/AlertTable';
import { AlertDetailDrawer } from '../components/alerts/AlertDetailDrawer';
import { AlertTriangle, Filter, RefreshCw, Radio } from 'lucide-react';
import { Button } from '../components/common/Button';

export const AlertsView: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);
  const [stateFilter, setStateFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await alertsApi.getAlerts({
        state: stateFilter !== 'ALL' ? (stateFilter as AlertState) : undefined,
        severity: severityFilter !== 'ALL' ? (severityFilter as AlertSeverity) : undefined,
      });
      setAlerts(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [stateFilter, severityFilter]);

  const handleAcknowledge = async (id: string, notes?: string) => {
    await alertsApi.acknowledgeAlert(id, notes);
    await fetchAlerts();
    setSelectedAlert(null);
  };

  const handleDispatch = async (id: string, unit: string, notes?: string) => {
    await alertsApi.dispatchAlert(id, { assigned_unit: unit, operator_notes: notes });
    await fetchAlerts();
    setSelectedAlert(null);
  };

  const handleResolve = async (id: string, reason: string, isFalsePositive = false) => {
    await alertsApi.resolveAlert(id, { resolution_reason: reason, is_false_positive: isFalsePositive });
    await fetchAlerts();
    setSelectedAlert(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-500" />
            Watchlist Alerts &amp; Incident Dispatch Matrix
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time push alerts with Acknowledge &rarr; Dispatch &rarr; Resolve lifecycle
          </p>
        </div>

        <Button variant="secondary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchAlerts} loading={loading}>
          Refresh Queue
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-[#0f172a] rounded-xl border border-slate-800 text-xs font-mono">
        <span className="text-slate-400">State:</span>
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200"
        >
          <option value="ALL">All States</option>
          <option value="NEW">NEW</option>
          <option value="ACKNOWLEDGED">ACKNOWLEDGED</option>
          <option value="DISPATCHED">DISPATCHED</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
        </select>

        <span className="text-slate-400">Severity:</span>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-slate-200"
        >
          <option value="ALL">All Severities</option>
          <option value="CRITICAL">CRITICAL</option>
          <option value="HIGH">HIGH</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="LOW">LOW</option>
        </select>
      </div>

      {/* Alert Table */}
      <AlertTable
        alerts={alerts}
        onSelectAlert={(a) => setSelectedAlert(a)}
        isLoading={loading}
      />

      {/* Detail Drawer */}
      <AlertDetailDrawer
        alert={selectedAlert}
        isOpen={Boolean(selectedAlert)}
        onClose={() => setSelectedAlert(null)}
        onAcknowledge={handleAcknowledge}
        onDispatch={handleDispatch}
        onResolve={handleResolve}
      />
    </div>
  );
};
