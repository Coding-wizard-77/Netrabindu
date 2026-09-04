import React, { useState, useEffect } from 'react';
import { Camera } from '../types';
import { camerasApi } from '../api/cameras';
import { VideoWallGrid } from '../components/video/VideoWallGrid';
import { useVideoWallStore, GridLayout } from '../store/useVideoWallStore';
import { Button } from '../components/common/Button';
import { Grid, LayoutGrid, Maximize2, Trash2, Camera as CameraIcon, Search } from 'lucide-react';
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

      // Auto-assign first 4 cameras if slots are empty
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
      {/* Top Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0f172a] rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <Grid className="w-5 h-5 text-cyan-400" />
          <span className="text-sm font-bold font-mono text-white">
            Tactical Video Wall Matrix
          </span>
        </div>

        {/* Layout Switcher */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          {layouts.map((l) => (
            <button
              key={l}
              onClick={() => setLayout(l)}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors ${
                layout === l ? 'bg-cyan-600 text-white shadow' : 'text-slate-400 hover:text-white'
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
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search cameras..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs font-mono text-white"
            />
          </div>

          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            {filteredCameras.map((cam) => (
              <div
                key={cam.id}
                onClick={() => {
                  assignCameraToSlot(selectedSlotIndex, cam);
                  setPickerOpen(false);
                }}
                className="p-3 bg-slate-900/80 hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/50 rounded-xl cursor-pointer transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="font-mono text-xs font-bold text-cyan-400">{cam.camera_code}</div>
                  <div className="text-xs font-semibold text-white mt-0.5">{cam.name}</div>
                  <div className="text-[10px] text-slate-400">{cam.department_name}</div>
                </div>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                    cam.status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
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
