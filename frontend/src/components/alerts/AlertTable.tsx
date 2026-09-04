import React from 'react';
import { Alert } from '../../types';
import { DataTable, Column } from '../common/DataTable';
import { Badge } from '../common/Badge';
import { PlateBadge } from '../anpr/PlateBadge';
import { formatToIST } from '../../utils/date';

interface AlertTableProps {
  alerts: Alert[];
  onSelectAlert: (alert: Alert) => void;
  isLoading?: boolean;
}

export const AlertTable: React.FC<AlertTableProps> = ({ alerts, onSelectAlert, isLoading }) => {
  const columns: Column<Alert>[] = [
    {
      key: 'severity',
      header: 'Severity',
      sortable: true,
      render: (a) => <Badge variant="severity" value={a.severity} />,
    },
    {
      key: 'detected_identifier',
      header: 'Plate / Target',
      render: (a) => (
        <div className="flex items-center gap-2">
          <PlateBadge plate={a.detected_identifier} />
          <span className="text-[11px] font-mono text-slate-400">({a.target_identifier})</span>
        </div>
      ),
    },
    {
      key: 'watchlist_category',
      header: 'Category',
      sortable: true,
      render: (a) => <span className="font-mono text-cyan-400">{a.watchlist_category}</span>,
    },
    {
      key: 'camera_name',
      header: 'Location / Camera',
      render: (a) => (
        <div>
          <div className="font-semibold text-slate-200">{a.camera_name}</div>
          <div className="text-[10px] text-slate-500">{a.department_name}</div>
        </div>
      ),
    },
    {
      key: 'occurred_at',
      header: 'Time (IST)',
      sortable: true,
      render: (a) => <span className="font-mono">{formatToIST(a.occurred_at, 'dd MMM, HH:mm:ss')}</span>,
    },
    {
      key: 'state',
      header: 'Status',
      sortable: true,
      render: (a) => <Badge variant="alertState" value={a.state} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={alerts}
      keyExtractor={(a) => a.id}
      onRowClick={onSelectAlert}
      isLoading={isLoading}
      searchPlaceholder="Filter alerts by plate, category, or camera..."
    />
  );
};
