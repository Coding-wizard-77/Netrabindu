import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  title = 'System Warning',
  message,
  onRetry,
}) => {
  return (
    <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-300 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
      <div className="flex-1">
        <h5 className="text-xs font-bold uppercase tracking-wider text-rose-400">{title}</h5>
        <p className="text-xs text-rose-200/90 mt-0.5">{message}</p>
      </div>
      {onRetry && (
        <Button size="sm" variant="danger" icon={<RefreshCw className="w-3 h-3" />} onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
};
