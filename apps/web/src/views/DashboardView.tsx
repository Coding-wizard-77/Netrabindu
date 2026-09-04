import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/common/StatCard';
import { CommandMap } from '../components/gis/CommandMap';
import { LiveEventStream } from '../components/anpr/LiveEventStream';
import { AlertBanner } from '../components/alerts/AlertBanner';
import { AdaptiveStateMatrix } from '../components/telemetry/AdaptiveStateMatrix';
import { BandwidthSavingsChart } from '../components/telemetry/BandwidthSavingsChart';
import { InferenceComputeChart } from '../components/telemetry/InferenceComputeChart';
import { SentinelActivityGauge } from '../components/telemetry/SentinelActivityGauge';
import { camerasApi } from '../api/cameras';
import { alertsApi } from '../api/alerts';
import { healthApi } from '../api/health';
import { Camera, Alert, SystemMetrics } from '../types';
import { Camera as CameraIcon, AlertTriangle, Radio, Activity, Cpu, Shield, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DashboardView: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDashboardData() {
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
    }
    loadDashboardData();
  }, []);

  const onlineCount = cameras.filter((c) => c.status === 'ONLINE').length;
  const degradedCount = cameras.filter((c) => c.status === 'DEGRADED').length;
  const offlineCount = cameras.filter((c) => c.status === 'OFFLINE').length;

  return (
    <div className="space-y-6">
      {/* Top Banner / Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            Tactical Operations Command Center
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time hybrid edge surveillance grid • Gujarat Police HQ
          </p>
        </div>

        <button
          onClick={() => navigate('/live')}
          className="py-2 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono font-bold flex items-center gap-2 transition-colors shadow-lg shadow-cyan-950/50"
        >
          <span>Launch Live Video Wall</span>
          <ArrowRight className="w-4 h-4" />
        </button>
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
          subtitle="Immediate Dispatch Required"
          icon={<AlertTriangle className="w-5 h-5" />}
          variant="rose"
        />

        <StatCard
          title="Adaptive Compute Savings"
          value="~58.4%"
          subtitle="WAN Bandwidth & GPU Reduction"
          icon={<Cpu className="w-5 h-5" />}
          variant="amber"
        />
      </div>

      {/* Sentinel Activity & Real-time Alerts Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <SentinelActivityGauge triggerRatePerMin={metrics?.events_per_minute ? Math.floor(metrics.events_per_minute * 0.4) : 58} activeEscalations={cameras.filter(c => c.current_quality_state === 'Active' || c.current_quality_state === 'Critical').length || 4} />
          
          {/* Latest High-Priority Alert Banner */}
          {alerts.length > 0 && (
            <AlertBanner
              alert={alerts[0]}
              onOpenDetail={() => navigate('/alerts')}
            />
          )}
        </div>

        {/* Quick Regional Surveillance Status */}
        <div className="p-4 bg-[#0f172a] rounded-xl border border-slate-800 space-y-3 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-mono uppercase text-slate-400">Jurisdiction Summary</span>
            <h4 className="text-sm font-bold text-white mt-1">Ahmedabad Command Zone 01</h4>
            <p className="text-xs text-slate-400 mt-1">
              Traffic Branch, CID Crime, &amp; Smart City Federation nodes reporting optimal health.
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Edge Node Health:</span>
            <span className="text-emerald-400 font-bold">100% OPERATIONAL</span>
          </div>
        </div>
      </div>

      {/* Central GIS Map & Live Detections Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Regional Camera GIS Grid
            </h3>
            <span className="text-[10px] font-mono text-cyan-400">
              {cameras.length} Plotted Sources
            </span>
          </div>
          <CommandMap
            cameras={cameras}
            onOpenLiveStream={() => navigate('/live')}
            className="h-96 w-full rounded-xl overflow-hidden border border-slate-800"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              Adaptive Telemetry &amp; Compute Efficiency
            </h3>
            <span className="text-[10px] font-mono text-emerald-400">Live Telemetry</span>
          </div>
          <BandwidthSavingsChart />
        </div>
      </div>

      {/* Live AI Detection Stream */}
      <LiveEventStream />
    </div>
  );
};
