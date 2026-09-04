import React from 'react';
import { Alert, AlertState } from '../../types';
import { Button } from '../common/Button';
import { CheckCircle, Send, XCircle, ShieldAlert } from 'lucide-react';

interface AlertActionButtonsProps {
  alert: Alert;
  onAcknowledge: (id: string) => void;
  onDispatch: (id: string) => void;
  onResolve: (id: string) => void;
  onMarkFalsePositive: (id: string) => void;
  loading?: boolean;
}

export const AlertActionButtons: React.FC<AlertActionButtonsProps> = ({
  alert,
  onAcknowledge,
  onDispatch,
  onResolve,
  onMarkFalsePositive,
  loading = false,
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {alert.state === 'NEW' && (
        <Button
          variant="tactical"
          size="sm"
          icon={<CheckCircle className="w-3.5 h-3.5" />}
          onClick={() => onAcknowledge(alert.id)}
          loading={loading}
        >
          Acknowledge
        </Button>
      )}

      {(alert.state === 'NEW' || alert.state === 'ACKNOWLEDGED') && (
        <Button
          variant="primary"
          size="sm"
          icon={<Send className="w-3.5 h-3.5" />}
          onClick={() => onDispatch(alert.id)}
          loading={loading}
        >
          Dispatch Unit
        </Button>
      )}

      {alert.state === 'DISPATCHED' && (
        <Button
          variant="tactical"
          size="sm"
          icon={<CheckCircle className="w-3.5 h-3.5" />}
          onClick={() => onResolve(alert.id)}
          loading={loading}
        >
          Mark Resolved
        </Button>
      )}

      {alert.state !== 'RESOLVED' && alert.state !== 'FALSE_POSITIVE' && (
        <Button
          variant="ghost"
          size="sm"
          icon={<XCircle className="w-3.5 h-3.5 text-slate-400" />}
          onClick={() => onMarkFalsePositive(alert.id)}
          loading={loading}
        >
          False Positive
        </Button>
      )}
    </div>
  );
};
