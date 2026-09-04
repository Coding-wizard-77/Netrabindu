import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/common/StatCard';
import { CommandMap } from '../components/gis/CommandMap';
import { LiveEventStream } from '../components/anpr/LiveEventStream';
import { AlertBanner } from '../components/alerts/AlertBanner';
import { LiveRadarScanner } from '../components/dashboard/LiveRadarScanner';
import { DepartmentDistributionChart } from '../components/dashboard/DepartmentDistributionChart';
import { IncidentHotspotMatrix } from '../components/dashboard/IncidentHotspotMatrix';
import { TacticalQuickActionBar } from '../components/dashboard/TacticalQuickActionBar';
import { PCRVanDispatcher } from '../components/police/PCRVanDispatcher';
import { DailyPoliceSitRepModal } from '../components/police/DailyPoliceSitRepModal';
import { NakabandiLockdownModal } from '../components/police/NakabandiLockdownModal';
import { BandwidthSavingsChart } from '../components/telemetry/BandwidthSavingsChart';
import { SentinelActivityGauge } from '../components/telemetry/SentinelActivityGauge';
import { camerasApi } from '../api/cameras';
import { alertsApi } from '../api/alerts';
import { healthApi } from '../api/health';
import { Camera, Alert, SystemMetrics } from '../types';
import { Camera as CameraIcon, AlertTriangle, Radio, Activity, Cpu, Shield, ArrowRight, Zap, ShieldAlert, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardView: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [sitRepOpen, setSitRepOpen] = useState(false);
  const [nakabandiOpen, setNakabandiOpen] = useState(false);
  const navigate = useNavigate();

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [cams, alts, mets] = await Promise.allSettled([
        camerasApi.getCameras(),
        alertsApi.getAlerts({ limit: 5 }),
        healthApi.getMetrics(),
      ]);

      if (cams.status === 'fulfilled') setCameras(cams.value);
      if (alts.status === 'fulfilled') setAlerts(alts.value);
      if (mets.status === 'fulfilled') setMetrics(mets.value);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onlineCount = cameras.filter((c) => c.status === 'ONLINE').length;
  const degradedCount = cameras.filter((c) => c.status === 'DEGRADED').length;
  const offlineCount = cameras.filter((c) => c.status === 'OFFLINE').length;

  return (
    <div className="space-y-6">
      {/* Tactical Quick Action Bar */}
      <TacticalQuickActionBar
        onExportReport={() => setSitRepOpen(true)}
        onRefreshGrid={fetchDashboardData}
        onTriggerOnboarding={() => navigate('/cameras')}
      />

      {/* Police Command Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-blue-950/40 via-slate-900 to-slate-900 rounded-2xl border border-blue-500/30">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono font-bold text-[10px] uppercase">
              GUJARAT POLICE STATE CORE
            </span>
            <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              GRID ACTIVE
            </span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white font-mono mt-1">
            INTEGRATED POLICE COMMAND &amp; CONTROL OPERATIONS CENTER
          </h1>
          <p className="text-xs text-slate-400 font-mono">
            Unified real-time tactical oversight across 26 Departmental CCTV networks &amp; 33 Police Districts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setNakabandiOpen(true)}
            className="py-2 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shadow-lg shadow-rose-950/50"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>State Nakabandi</span>
          </button>

          <button
            onClick={() => navigate('/live')}
            className="py-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold flex items-center gap-2 transition-colors shadow-lg shadow-cyan-950/50"
          >
            <Radio className="w-4 h-4" />
            <span>Video Wall</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Real-time Dynamic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Cameras"
          value={cameras.length}
          subtitle={`${onlineCount} Online • ${degradedCount} Degraded • ${offlineCount} Offline`}
          icon={<CameraIcon className="w-5 h-5" />}
          variant="cyan"
          trend={{ value: `${onlineCount} Active Feeds`, isPositive: true }}
        />

        <StatCard
          title="Event Ingestion Rate"
          value={`${metrics?.events_per_minute || 142} /m`}
          subtitle="Redpanda Event Bus Throughput"
          icon={<Radio className="w-5 h-5" />}
          variant="emerald"
        />

        <StatCard
          title="Critical Active Alerts"
          value={metrics?.active_critical_alerts || alerts.filter((a) => a.severity === 'CRITICAL' && a.state === 'NEW').length}
          subtitle="Immediate PCR Dispatch Required"
          icon={<AlertTriangle className="w-5 h-5" />}
          variant="rose"
        />

        <StatCard
          title="Adaptive Compute Savings"
          value="~64.2%"
          subtitle="WAN Bandwidth & GPU Reduction"
          icon={<Cpu className="w-5 h-5" />}
          variant="amber"
        />
      </div>

      {/* Sentinel Radar Scanner & Hotspot Matrix Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LiveRadarScanner />
        </div>
        <div>
          <IncidentHotspotMatrix />
        </div>
      </div>

      {/* Police PCR Interceptor Fleet & 26 Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PCRVanDispatcher />
        <DepartmentDistributionChart />
      </div>

      {/* GIS Command Map & Telemetry Efficiency Curves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-500" />
              Regional Camera GIS Grid
            </h3>
            <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
              {cameras.length} Plotted Sources
            </span>
          </div>
          <CommandMap
            cameras={cameras}
            onOpenLiveStream={() => navigate('/live')}
            className="h-[360px] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
              Adaptive Telemetry &amp; Compute Efficiency
            </h3>
            <span className="text-[10px] font-mono text-emerald-500 font-bold">Measured Metrics</span>
          </div>
          <BandwidthSavingsChart />
        </div>
      </div>

      {/* Live Intelligence Stream */}
      <LiveEventStream />

      {/* Modals */}
      <DailyPoliceSitRepModal isOpen={sitRepOpen} onClose={() => setSitRepOpen(false)} />
      <NakabandiLockdownModal isOpen={nakabandiOpen} onClose={() => setNakabandiOpen(false)} targetPlate="GJ 01 AB 1234" />
    </div>
  );
};
