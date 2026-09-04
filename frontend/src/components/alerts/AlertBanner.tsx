import React from 'react';
import { Alert } from '../../types';
import { AlertTriangle, Clock, MapPin, ChevronRight } from 'lucide-react';
import { PlateBadge } from '../anpr/PlateBadge';
import { Badge } from '../common/Badge';
import { formatToIST } from '../../utils/date';

interface AlertBannerProps {
  alert: Alert;
  onOpenDetail?: (alert: Alert) => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ alert, onOpenDetail }) => {
  return (
    <div
      onClick={() => onOpenDetail && onOpenDetail(alert)}
      className="p-3.5 rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-slate-900/80 to-slate-900/80 text-white cursor-pointer hover:border-rose-400 transition-all shadow-lg shadow-rose-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-rose-600/30 border border-rose-500 text-rose-400 animate-pulse">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="severity" value={alert.severity} />
            <span className="font-mono text-xs font-bold text-rose-300">
              {alert.watchlist_category}
            </span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <PlateBadge plate={alert.detected_identifier} />
            <span className="text-xs text-slate-300 font-mono">
              Target: <strong className="text-white">{alert.target_identifier}</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
        <div className="text-right">
          <div className="text-slate-200 font-semibold">{alert.camera_name}</div>
          <div className="text-[11px] text-slate-400">{formatToIST(alert.occurred_at, 'HH:mm:ss')}</div>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500" />
      </div>
    </div>
  );
};
