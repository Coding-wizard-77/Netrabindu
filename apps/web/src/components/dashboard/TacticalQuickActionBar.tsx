import React from 'react';
import { Shield, FileText, Radio, Camera, RefreshCw, Lock } from 'lucide-react';
import { Button } from '../common/Button';

interface TacticalQuickActionBarProps {
  onExportReport?: () => void;
  onRefreshGrid?: () => void;
  onTriggerOnboarding?: () => void;
}

export const TacticalQuickActionBar: React.FC<TacticalQuickActionBarProps> = ({
  onExportReport,
  onRefreshGrid,
  onTriggerOnboarding,
}) => {
  return (
    <div className="glass-panel p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2 text-xs font-mono">
        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="font-bold text-slate-900 dark:text-white">COMMAND SHORTCUTS:</span>
        <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">Tactical Response Operations</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          icon={<FileText className="w-3.5 h-3.5 text-cyan-400" />}
          onClick={onExportReport}
        >
          Daily SitRep
        </Button>
        <Button
          variant="outline"
          size="sm"
          icon={<Radio className="w-3.5 h-3.5 text-emerald-400" />}
          onClick={onTriggerOnboarding}
        >
          ONVIF Probe
        </Button>
        <Button
          variant="secondary"
          size="sm"
          icon={<RefreshCw className="w-3.5 h-3.5" />}
          onClick={onRefreshGrid}
        >
          Sync Feeds
        </Button>
      </div>
    </div>
  );
};
