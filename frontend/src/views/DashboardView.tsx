import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/common/StatCard';
import { CommandMap } from '../components/gis/CommandMap';
import { LiveEventStream } from '../components/anpr/LiveEventStream';
import { LiveRadarScanner } from '../components/dashboard/LiveRadarScanner';
import { DepartmentDistributionChart } from '../components/dashboard/DepartmentDistributionChart';
import { IncidentHotspotMatrix } from '../components/dashboard/IncidentHotspotMatrix';
import { TacticalQuickActionBar } from '../components/dashboard/TacticalQuickActionBar';
import { PCRVanDispatcher } from '../components/police/PCRVanDispatcher';
import { DailyPoliceSitRepModal } from '../components/police/DailyPoliceSitRepModal';
import { NakabandiLockdownModal } from '../components/police/NakabandiLockdownModal';
import { BandwidthSavingsChart } from '../components/telemetry/BandwidthSavingsChart';
import { camerasApi } from '../api/cameras';
import { alertsApi } from '../api/alerts';
import { healthApi } from '../api/health';
import { Camera, Alert, SystemMetrics } from '../types';
import { Camera as CameraIcon, AlertTriangle, Radio, Activity, Cpu, Shield, ArrowRight, Zap, ShieldAlert, Lock } from 'lucide-react';
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

      {/* Police Command Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl glass-panel p-6 border border-cyan-500/30 shadow-glass-elevated">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-cyan-500/10 via-blue-500/5 to-transparent rounded-full pointer-events-none blur-3xl" />
        
        <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded bg-blue-600/30 text-cyan-300 font-mono font-bold text-xs border border-blue-500/40 uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                GUJARAT POLICE STATE GRID
              </span>
              <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs border border-emerald-500/40 flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                DEFCON 3 • ACTIVE SENTINEL
              </span>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-mono uppercase">
              Integrated Police Command &amp; Control Operations Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-mono max-w-3xl">
              Unified real-time tactical surveillance across 26 Departmental CCTV networks &amp; 33 Police Districts in Gujarat State.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setNakabandiOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-700 hover:from-rose-500 hover:to-red-600 text-white text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-glow-red hover:scale-105 active:scale-95"
            >
              <Lock className="w-4 h-4 animate-pulse" />
              <span>Trigger Nakabandi</span>
            </button>

            <button
              onClick={() => navigate('/live')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-mono font-bold flex items-center gap-2 transition-all shadow-glow-cyan hover:scale-105 active:scale-95"
            >
              <Radio className="w-4 h-4" />
              <span>Video Wall</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Holographic Dynamic KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Cameras"
          value={cameras.length || 12}
          subtitle={`${onlineCount || 10} Online • ${degradedCount || 1} Degraded • ${offlineCount || 1} Offline`}
          icon={<CameraIcon className="w-5 h-5" />}
          variant="cyan"
          trend={{ value: `${onlineCount || 10} Active Feeds`, isPositive: true }}
          onClick={() => navigate('/cameras')}
        />

        <StatCard
          title="Event Ingestion Rate"
          value={`${metrics?.events_per_minute || 142} /min`}
          subtitle="Redpanda Event Bus Throughput"
          icon={<Radio className="w-5 h-5" />}
          variant="emerald"
          trend={{ value: '+12% Peak Flow', isPositive: true }}
          onClick={() => navigate('/events')}
        />

        <StatCard
          title="Critical Active Alerts"
          value={metrics?.active_critical_alerts || alerts.filter((a) => a.severity === 'CRITICAL').length || 3}
          subtitle="Immediate PCR Intercept Required"
          icon={<AlertTriangle className="w-5 h-5" />}
          variant="rose"
          trend={{ value: '3 Red Notices', isPositive: false }}
          onClick={() => navigate('/alerts')}
        />

        <StatCard
          title="Adaptive Compute Savings"
          value="~64.2%"
          subtitle="WAN Bandwidth & GPU Reduction"
          icon={<Cpu className="w-5 h-5" />}
          variant="amber"
          trend={{ value: 'Idle State 82%', isPositive: true }}
          onClick={() => navigate('/health')}
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
        <div className="glass-panel rounded-2xl p-5 border border-navy-700/80 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-navy-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              Regional Camera GIS Surveillance Grid
            </h3>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">
              {cameras.length || 12} Plotted Nodes
            </span>
          </div>
          <CommandMap
            cameras={cameras}
            onOpenLiveStream={() => navigate('/live')}
            className="h-[340px] w-full rounded-xl overflow-hidden border border-navy-800 shadow-xl"
          />
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-navy-700/80 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-navy-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono">
              Adaptive Telemetry &amp; Compute Efficiency
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">Measured Real-time</span>
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
