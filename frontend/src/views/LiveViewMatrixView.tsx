import React, { useState, useEffect } from 'react';
import { Camera } from '../types';
import { camerasApi } from '../api/cameras';
import { VideoWallGrid } from '../components/video/VideoWallGrid';
import { useVideoWallStore, GridLayout } from '../store/useVideoWallStore';
import { Button } from '../components/common/Button';
import { Grid, LayoutGrid, Maximize2, Trash2, Camera as CameraIcon, Search, Radio, Shield } from 'lucide-react';
import { Drawer } from '../components/common/Drawer';

export const LiveViewMatrixView: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const { layout, setLayout, slots, assignCameraToSlot, selectedSlotIndex, clearWall } = useVideoWallStore();

  useEffect(() => {
    async function loadCameras() {
      const res = await camerasApi.getCameras();
      setCameras(res);

      if (!slots[0] && res.length > 0) {
        assignCameraToSlot(0, res[0] || null);
        if (res[1]) assignCameraToSlot(1, res[1]);
        if (res[2]) assignCameraToSlot(2, res[2]);
        if (res[3]) assignCameraToSlot(3, res[3]);
      }
    }
    loadCameras();
  }, []);

  const layouts: GridLayout[] = ['1x1', '2x2', '3x3', '1+5', '4x4'];

  const filteredCameras = cameras.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.camera_code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 h-[calc(100vh-8.5rem)] flex flex-col">
      {/* Top Controls Glass Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 glass-panel rounded-2xl border border-slate-200 dark:border-navy-700/80 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-500 dark:text-cyan-400 border border-cyan-500/30">
            <Radio className="w-5 h-5 text-cyan-500 dark:text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-black font-mono text-slate-900 dark:text-white tracking-wider uppercase flex items-center gap-2">
              Tactical Video Wall Matrix
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 font-mono">1080P60 HLS/WebRTC</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Multi-Spectrum Surveillance Matrix &amp; PTZ Control</p>
          </div>
        </div>

        {/* Layout Switcher Pills */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-navy-950 p-1.5 rounded-xl border border-slate-200 dark:border-navy-800">
          {layouts.map((l) => (
            <button
              key={l}
              onClick={() => setLayout(l)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                layout === l
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-glow-cyan'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-navy-850'
              }`}
            >
              {l}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            icon={<CameraIcon className="w-3.5 h-3.5" />}
            onClick={() => setPickerOpen(true)}
          >
            Assign Camera
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<Trash2 className="w-3.5 h-3.5 text-slate-400" />}
            onClick={clearWall}
          >
            Clear Wall
          </Button>
        </div>
      </div>

      {/* Multi-Grid Matrix */}
      <div className="flex-1 w-full min-h-0">
        <VideoWallGrid onSlotClick={() => setPickerOpen(true)} />
      </div>

      {/* Camera Selection Drawer */}
      <Drawer
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title={`Assign Camera to Slot ${selectedSlotIndex + 1}`}
        subtitle="Select an authorized surveillance stream"
        width="md"
      >
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search cameras by code, name, district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-navy-700 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {filteredCameras.map((cam) => (
              <div
                key={cam.id}
                onClick={() => {
                  assignCameraToSlot(selectedSlotIndex, cam);
                  setPickerOpen(false);
                }}
                className="p-3 bg-slate-50 dark:bg-navy-900/80 hover:bg-cyan-50 dark:hover:bg-cyan-950/50 border border-slate-200 dark:border-navy-800 hover:border-cyan-500/50 rounded-xl cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-mono text-xs font-bold text-cyan-600 dark:text-cyan-400">{cam.camera_code}</div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white mt-0.5">{cam.name}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">{cam.department_name || 'Traffic Police Grid'}</div>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${
                    cam.status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  }`}
                >
                  {cam.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Drawer>
    </div>
  );
};
