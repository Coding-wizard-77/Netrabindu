import React, { useState, useEffect } from 'react';
import { Camera, CameraStatus } from '../types';
import { camerasApi } from '../api/cameras';
import { Button } from '../components/common/Button';
import { Drawer } from '../components/common/Drawer';
import { OnboardingWizard } from '../components/onboarding/OnboardingWizard';
import { LiveVideoPlayer } from '../components/video/LiveVideoPlayer';
import { Camera as CameraIcon, Plus, Search, RefreshCw } from 'lucide-react';

export const CameraRegistryView: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const fetchCameras = async () => {
    try {
      setLoading(true);
      const res = await camerasApi.getCameras({
        status: statusFilter !== 'ALL' ? (statusFilter as CameraStatus) : undefined,
      });
      setCameras(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, [statusFilter]);

  const filteredCameras = cameras.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.camera_code.toLowerCase().includes(search.toLowerCase()) ||
      (c.department_name && c.department_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 glass-panel rounded-2xl border border-cyan-500/30 shadow-glass-elevated">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/40 uppercase">
              DISTRICT CAMERA NETWORK
            </span>
            <span className="text-xs font-mono text-slate-400">ONVIF / RTSP / WebRTC Multi-Protocol</span>
          </div>
          <h1 className="text-xl font-black tracking-tight text-white font-mono flex items-center gap-2.5">
            <CameraIcon className="w-6 h-6 text-cyan-400" />
            Camera Registry &amp; Stream Diagnostics
          </h1>
          <p className="text-xs text-slate-300 font-mono">
            Statewide CCTV camera repository &bull; Ping Latency Monitoring &bull; Automated Stream Health Check
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setWizardOpen(true)}
          >
            Register Camera
          </Button>
          <Button
            variant="secondary"
            size="sm"
            icon={<RefreshCw className="w-3.5 h-3.5" />}
            onClick={fetchCameras}
            loading={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 glass-panel rounded-2xl border border-navy-700 text-xs font-mono">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by name, camera code, district..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-navy-950 border border-navy-700 rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {['ALL', 'ONLINE', 'DEGRADED', 'OFFLINE'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-bold transition-colors ${
                statusFilter === st
                  ? 'bg-cyan-600 text-white shadow-glow-cyan'
                  : 'bg-navy-900 text-slate-400 hover:text-white border border-navy-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Camera Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCameras.map((cam) => (
          <div
            key={cam.id}
            onClick={() => setSelectedCamera(cam)}
            className="glass-panel-interactive rounded-2xl p-4 border border-navy-800 hover:border-cyan-500/50 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-cyan-400">{cam.camera_code}</span>
                <h3 className="font-bold text-white text-sm mt-0.5">{cam.name}</h3>
                <span className="text-[10px] text-slate-400 font-mono">{cam.department_name || 'Traffic Police'}</span>
              </div>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  cam.status === 'ONLINE'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                    : cam.status === 'DEGRADED'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                }`}
              >
                {cam.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-navy-950/60 p-2.5 rounded-xl border border-navy-850">
              <div>
                <span className="text-slate-500 block text-[10px]">RESOLUTION</span>
                <span className="text-slate-200">1080p60 FHD</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">PROTOCOL</span>
                <span className="text-emerald-400 font-bold">{cam.protocol || 'RTSP'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Camera Stream Diagnostic Drawer */}
      <Drawer
        isOpen={Boolean(selectedCamera)}
        onClose={() => setSelectedCamera(null)}
        title={selectedCamera?.name || 'Camera Diagnostics'}
        subtitle={`ID: ${selectedCamera?.camera_code} • Department: ${selectedCamera?.department_name || 'Traffic'}`}
        width="lg"
      >
        {selectedCamera && (
          <div className="space-y-4">
            <div className="h-64 rounded-xl overflow-hidden border border-navy-700">
              <LiveVideoPlayer camera={selectedCamera} />
            </div>

            <div className="space-y-2 text-xs font-mono">
              <h4 className="font-bold text-slate-300">STREAM TELEMETRY</h4>
              <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 space-y-1.5">
                <div><span className="text-slate-500">ENDPOINT REF:</span> <span className="text-slate-300 break-all">{selectedCamera.endpoint_ref || 'rtsp://10.0.4.12:554/live/stream0'}</span></div>
                <div><span className="text-slate-500">COORDINATES:</span> <span className="text-cyan-400">{selectedCamera.location?.lat || 23.0225}, {selectedCamera.location?.lon || 72.5714}</span></div>
                <div><span className="text-slate-500">FRAME RATE:</span> <span className="text-slate-200">{selectedCamera.fps || 25} FPS</span></div>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* Onboarding Wizard Modal */}
      <OnboardingWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSuccess={() => {
          setWizardOpen(false);
          fetchCameras();
        }}
      />
    </div>
  );
};
