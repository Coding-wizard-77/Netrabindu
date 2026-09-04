import React, { useState, useEffect } from 'react';
import { Camera, SourceType, AnalyticsProfile, CameraStatus } from '../types';
import { camerasApi } from '../api/cameras';
import { CommandMap } from '../components/gis/CommandMap';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Drawer } from '../components/common/Drawer';
import { OnboardingWizard } from '../components/onboarding/OnboardingWizard';
import { LiveVideoPlayer } from '../components/video/LiveVideoPlayer';
import { Plus, Video, Radio, RefreshCw, Layers, ShieldCheck, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CameraRegistryView: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [profileFilter, setProfileFilter] = useState<string>('ALL');
  const navigate = useNavigate();

  const fetchCameras = async () => {
    try {
      setLoading(true);
      const res = await camerasApi.getCameras();
      setCameras(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  const filteredCameras = cameras.filter((c) => {
    if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
    if (profileFilter !== 'ALL' && c.analytics_profile !== profileFilter) return false;
    return true;
  });

  const columns: Column<Camera>[] = [
    {
      key: 'camera_code',
      header: 'Code',
      sortable: true,
      render: (c) => <span className="font-mono font-bold text-cyan-400">{c.camera_code}</span>,
    },
    {
      key: 'name',
      header: 'Camera Name / Address',
      sortable: true,
      render: (c) => (
        <div>
          <div className="font-semibold text-slate-200">{c.name}</div>
          <div className="text-[10px] text-slate-500 truncate max-w-xs">{c.address || 'Ahmedabad, Gujarat'}</div>
        </div>
      ),
    },
    {
      key: 'department_name',
      header: 'Department',
      sortable: true,
      render: (c) => <span className="text-slate-300">{c.department_name || 'Gujarat Police'}</span>,
    },
    {
      key: 'analytics_profile',
      header: 'AI Profile',
      sortable: true,
      render: (c) => (
        <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
          {c.analytics_profile}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Health Status',
      sortable: true,
      render: (c) => <Badge variant="status" value={c.status} />,
    },
    {
      key: 'current_quality_state',
      header: 'Adaptive State',
      sortable: true,
      render: (c) => <Badge variant="quality" value={c.current_quality_state || 'Normal'} />,
    },
  ];

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-cyan-400" />
            Heterogeneous Camera Registry &amp; GIS
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Control plane authority • Single source of truth across 26 departments
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={fetchCameras}>
            Refresh
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setWizardOpen(true)}
          >
            Onboard Camera
          </Button>
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-3 p-3 bg-[#0f172a] rounded-xl border border-slate-800 text-xs font-mono">
        <span className="text-slate-400">Filters:</span>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
        >
          <option value="ALL">All Statuses</option>
          <option value="ONLINE">ONLINE</option>
          <option value="DEGRADED">DEGRADED</option>
          <option value="OFFLINE">OFFLINE</option>
          <option value="UNKNOWN">UNKNOWN</option>
        </select>

        <select
          value={profileFilter}
          onChange={(e) => setProfileFilter(e.target.value)}
          className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
        >
          <option value="ALL">All AI Profiles</option>
          <option value="ANPR">ANPR</option>
          <option value="PERSON">PERSON</option>
          <option value="VEHICLE">VEHICLE</option>
          <option value="NONE">NONE</option>
        </select>

        <span className="text-slate-500 ml-auto">
          {filteredCameras.length} of {cameras.length} cameras active
        </span>
      </div>

      {/* Synchronized GIS Map */}
      <CommandMap
        cameras={filteredCameras}
        onSelectCamera={(cam) => setSelectedCamera(cam)}
        onOpenLiveStream={(cam) => {
          setSelectedCamera(cam);
        }}
        className="h-80 w-full rounded-xl overflow-hidden border border-slate-800"
      />

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={filteredCameras}
        keyExtractor={(c) => c.id}
        onRowClick={(c) => setSelectedCamera(c)}
        isLoading={loading}
        searchPlaceholder="Search cameras by code, name, vendor..."
      />

      {/* Camera Detail Drawer */}
      <Drawer
        isOpen={Boolean(selectedCamera)}
        onClose={() => setSelectedCamera(null)}
        title={selectedCamera?.name || 'Camera Details'}
        subtitle={`Code: ${selectedCamera?.camera_code || ''}`}
        width="lg"
      >
        {selectedCamera && (
          <div className="space-y-4">
            {/* Live Feed Stream Box */}
            <div className="h-64 w-full rounded-xl overflow-hidden border border-slate-800">
              <LiveVideoPlayer camera={selectedCamera} />
            </div>

            {/* Hardware & Registry Specifications */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
              <h5 className="font-bold text-white uppercase text-[11px] pb-1 border-b border-slate-800">
                Control Plane Metadata
              </h5>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>Vendor: <strong className="text-white">{selectedCamera.vendor}</strong></div>
                <div>Model: <strong className="text-white">{selectedCamera.model}</strong></div>
                <div>Source Kind: <strong className="text-cyan-400">{selectedCamera.source_type}</strong></div>
                <div>Protocol: <strong className="text-white">{selectedCamera.protocol}</strong></div>
                <div>Retention: <strong className="text-white">{selectedCamera.retention_days} Days</strong></div>
                <div>Profile: <strong className="text-emerald-400">{selectedCamera.analytics_profile}</strong></div>
              </div>
            </div>

            {/* Coordinates */}
            <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 text-xs font-mono text-slate-400">
              Coordinates: {selectedCamera.location.lat.toFixed(5)}, {selectedCamera.location.lon.toFixed(5)}
            </div>

            <div className="flex gap-2">
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                icon={<Video className="w-4 h-4" />}
                onClick={() => navigate('/live')}
              >
                Open in Multi-Grid Wall
              </Button>
            </div>
          </div>
        )}
      </Drawer>

      {/* Onboarding Wizard Modal */}
      <OnboardingWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        onSuccess={() => fetchCameras()}
      />
    </div>
  );
};
