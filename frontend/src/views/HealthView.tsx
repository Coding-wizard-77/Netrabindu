import React, { useState, useEffect } from 'react';
import { healthApi } from '../api/health';
import { SystemMetrics } from '../types';
import { SentinelActivityGauge } from '../components/telemetry/SentinelActivityGauge';
import { BandwidthSavingsChart } from '../components/telemetry/BandwidthSavingsChart';
import { InferenceComputeChart } from '../components/telemetry/InferenceComputeChart';
import { AdaptiveStateMatrix } from '../components/telemetry/AdaptiveStateMatrix';
import { Activity, Cpu, HardDrive, RefreshCw, Zap, Shield, Radio } from 'lucide-react';
import { Button } from '../components/common/Button';

export const HealthView: React.FC = () => {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      setLoading(true);
      const res = await healthApi.getMetrics();
      setMetrics(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 glass-panel rounded-2xl border border-cyan-500/30 shadow-glass-elevated">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs font-bold border border-emerald-500/40 uppercase">
              EDGE INFERENCE TELEMETRY
            </span>
            <span className="text-xs font-mono text-cyan-400">YOLOv8 + PaddleOCR + DeepSORT Stack</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white font-mono flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-emerald-400 animate-pulse" />
            System Health &amp; GPU Edge Telemetry
          </h1>
          <p className="text-xs text-slate-300 font-mono">
            Real-time inference profiling &bull; 3-Tier Adaptive Sentinel savings &bull; Event bus latency
          </p>
        </div>

        <Button variant="secondary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchHealth} loading={loading}>
          Refresh Metrics
        </Button>
      </div>

      {/* 3-Tier Adaptive Sentinel Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SentinelActivityGauge />
        </div>
        <div className="lg:col-span-2">
          <AdaptiveStateMatrix />
        </div>
      </div>

      {/* Compute & Bandwidth Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel rounded-2xl p-5 border border-navy-700/80 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-navy-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-cyan-400" />
              Edge GPU Compute Load Profiling
            </h3>
            <span className="text-[10px] font-mono text-cyan-400 font-bold">14.8 ms Avg Latency</span>
          </div>
          <InferenceComputeChart />
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-navy-700/80 shadow-2xl space-y-3">
          <div className="flex items-center justify-between border-b border-navy-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 font-mono flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-emerald-400" />
              WAN Bandwidth Reduction (Adaptive Sentinel)
            </h3>
            <span className="text-[10px] font-mono text-emerald-400 font-bold">-64.2% WAN Load</span>
          </div>
          <BandwidthSavingsChart />
        </div>
      </div>
    </div>
  );
};
