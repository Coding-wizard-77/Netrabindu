import React, { useState, useEffect } from 'react';
import { AuditLogEntry } from '../types';
import { auditApi } from '../api/audit';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Drawer } from '../components/common/Drawer';
import { FileText, Download, Shield, RefreshCw } from 'lucide-react';
import { formatToIST } from '../utils/date';
import { exportToCsv } from '../utils/export';

export const AuditView: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await auditApi.getAuditLogs({ limit: 50 });
      setLogs(res.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExport = () => {
    exportToCsv('netrabindu_audit_logs.csv', logs);
  };

  const columns: Column<AuditLogEntry>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp (IST)',
      sortable: true,
      render: (l) => <span className="font-mono text-xs">{formatToIST(l.timestamp)}</span>,
    },
    {
      key: 'actor_username',
      header: 'Operator / Principal',
      sortable: true,
      render: (l) => <span className="font-mono font-bold text-cyan-400">{l.actor_username}</span>,
    },
    {
      key: 'action',
      header: 'Action',
      sortable: true,
      render: (l) => <span className="font-mono text-xs text-white">{l.action}</span>,
    },
    {
      key: 'target_resource',
      header: 'Target Resource',
      render: (l) => <span className="font-mono text-slate-400 text-[11px]">{l.target_resource} ({l.target_id})</span>,
    },
    {
      key: 'ip_address',
      header: 'IP Address',
      render: (l) => <span className="font-mono text-slate-500 text-[11px]">{l.ip_address}</span>,
    },
    {
      key: 'result',
      header: 'Result',
      sortable: true,
      render: (l) => <Badge variant="status" value={l.result === 'SUCCESS' ? 'ONLINE' : 'OFFLINE'} />,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            Immutable Compliance Audit Trail
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Cryptographically sealed operational and access governance logs
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchLogs} loading={loading}>
            Refresh
          </Button>
          <Button variant="tactical" size="sm" icon={<Download className="w-3.5 h-3.5" />} onClick={handleExport}>
            Export CSV
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        keyExtractor={(l) => l.id}
        onRowClick={(l) => setSelectedLog(l)}
        isLoading={loading}
        searchPlaceholder="Search audit events by operator, action, IP..."
      />

      <Drawer
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="Audit Event Details"
        subtitle={`Log ID: ${selectedLog?.id}`}
        width="md"
      >
        {selectedLog && (
          <div className="space-y-4 text-xs font-mono">
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div>Actor: <strong className="text-white">{selectedLog.actor_username}</strong></div>
              <div>Action: <strong className="text-cyan-400">{selectedLog.action}</strong></div>
              <div>Target: <strong className="text-white">{selectedLog.target_resource} ({selectedLog.target_id})</strong></div>
              <div>Timestamp: <strong className="text-white">{formatToIST(selectedLog.timestamp)}</strong></div>
              <div>IP: <strong className="text-slate-400">{selectedLog.ip_address}</strong></div>
              <div>Result: <strong className={selectedLog.result === 'SUCCESS' ? 'text-emerald-400' : 'text-rose-400'}>{selectedLog.result}</strong></div>
            </div>

            {selectedLog.details && (
              <div className="space-y-1">
                <span className="text-slate-500 uppercase">Payload Metadata</span>
                <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-[11px] text-slate-300 overflow-x-auto">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};
