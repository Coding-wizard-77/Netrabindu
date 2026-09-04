import React, { useState, useEffect } from 'react';
import { Alert, AlertState, AlertSeverity } from '../types';
import { alertsApi } from '../api/alerts';
import { AlertTable } from '../components/alerts/AlertTable';
import { AlertDetailDrawer } from '../components/alerts/AlertDetailDrawer';
import { AlertTriangle, Filter, RefreshCw, Radio, ShieldAlert, CheckCircle2, Clock } from 'lucide-react';
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

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const newCount = alerts.filter((a) => a.state === 'NEW').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 glass-panel rounded-2xl border border-rose-500/30 shadow-glass-elevated">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-mono text-xs font-bold border border-rose-500/40 uppercase">
              RED NOTICE INTELLIGENCE
            </span>
            <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400" /> Avg Dispatch SLA: &lt; 3 mins
            </span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white font-mono flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-rose-500 animate-pulse" />
            Watchlist Alerts &amp; Incident Intercept Matrix
          </h1>
          <p className="text-xs text-slate-300 font-mono">
            Automated hotlist plate detection &bull; Immediate PCR Intercept Vectoring &bull; Statutory Audit Log
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-600/40 text-center font-mono">
            <div className="text-xl font-black text-rose-400">{criticalCount}</div>
            <div className="text-[10px] text-slate-400 uppercase font-bold">Critical Alerts</div>
          </div>
          <Button variant="secondary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchAlerts} loading={loading}>
            Refresh Queue
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 glass-panel rounded-2xl border border-navy-700 text-xs font-mono">
        <span className="text-slate-400 font-bold uppercase text-[11px]">Workflow State:</span>
        {['ALL', 'NEW', 'ACKNOWLEDGED', 'DISPATCHED', 'RESOLVED'].map((st) => (
          <button
            key={st}
            onClick={() => setStateFilter(st)}
            className={`px-3 py-1 rounded-lg font-bold transition-colors ${
              stateFilter === st
                ? 'bg-cyan-600 text-white shadow-glow-cyan'
                : 'bg-navy-900 text-slate-400 hover:text-white border border-navy-800'
            }`}
          >
            {st}
          </button>
        ))}

        <div className="h-4 w-[1px] bg-navy-800 mx-2 hidden sm:block" />

        <span className="text-slate-400 font-bold uppercase text-[11px]">Severity:</span>
        {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'].map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(sev)}
            className={`px-3 py-1 rounded-lg font-bold transition-colors ${
              severityFilter === sev
                ? 'bg-rose-600 text-white shadow-glow-red'
                : 'bg-navy-900 text-slate-400 hover:text-white border border-navy-800'
            }`}
          >
            {sev}
          </button>
        ))}
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
