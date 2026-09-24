import React, { useState, useEffect, useRef } from 'react';
import { Camera } from '../types';
import { camerasApi } from '../api/cameras';
import { sentinelApi, IngestCameraItem } from '../api/sentinel';
import { wsManager } from '../api/websocket';
import { useAlertStore } from '../store/useAlertStore';
import { VideoWallGrid } from '../components/video/VideoWallGrid';
import { LiveVideoPlayer } from '../components/video/LiveVideoPlayer';
import { useVideoWallStore, GridLayout, getLayoutSlotCount } from '../store/useVideoWallStore';
import { Button } from '../components/common/Button';
import { 
  Radio, 
  Trash2, 
  Camera as CameraIcon, 
  Search, 
  Shield, 
  Sparkles, 
  Maximize, 
  X, 
  Activity, 
  Layers, 
  MapPin, 
  GripVertical,
  Move,
  Minimize2,
  Maximize2,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Drawer } from '../components/common/Drawer';

const FALLBACK_SENTINEL_CAMERAS: Camera[] = [
  { id: 'cam01', camera_code: 'GJ-POL-CAM01', name: 'Chimanbhai Bridge, Sabarmati Riverfront', department_id: 'HOME-POLICE', department_code: 'HOME-POLICE', department_name: 'Gujarat Police State Grid', location: { lat: 23.056, lon: 72.58 }, address: 'Sabarmati Riverfront, Ahmedabad', vendor: 'Gujarat Certified', model: 'H.264', source_type: 'DIRECT_RTSP', protocol: 'RTSP', status: 'ONLINE', analytics_profile: 'ANPR', retention_days: 15, fps: 25, bitrate_kbps: 2048, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cam02', camera_code: 'GJ-POL-CAM02', name: 'Janpath, Ashram Road Junction', department_id: 'HOME-POLICE', department_code: 'HOME-POLICE', department_name: 'Gujarat Police State Grid', location: { lat: 23.031, lon: 72.571 }, address: 'Ashram Road, Ahmedabad', vendor: 'Gujarat Certified', model: 'H.264', source_type: 'DIRECT_RTSP', protocol: 'RTSP', status: 'ONLINE', analytics_profile: 'ANPR', retention_days: 15, fps: 25, bitrate_kbps: 2048, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cam03', camera_code: 'GJ-POL-CAM03', name: 'O.N.G.C. Office Junction, Chandkheda', department_id: 'HOME-POLICE', department_code: 'HOME-POLICE', department_name: 'Gujarat Police State Grid', location: { lat: 23.104, lon: 72.589 }, address: 'Chandkheda, Ahmedabad', vendor: 'Gujarat Certified', model: 'H.264', source_type: 'DIRECT_RTSP', protocol: 'RTSP', status: 'ONLINE', analytics_profile: 'ANPR', retention_days: 15, fps: 25, bitrate_kbps: 2048, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cam04', camera_code: 'GJ-POL-CAM04', name: 'Paldi Circle Junction', department_id: 'HOME-POLICE', department_code: 'HOME-POLICE', department_name: 'Gujarat Police State Grid', location: { lat: 23.013, lon: 72.562 }, address: 'Paldi, Ahmedabad', vendor: 'Gujarat Certified', model: 'H.264', source_type: 'DIRECT_RTSP', protocol: 'RTSP', status: 'ONLINE', analytics_profile: 'ANPR', retention_days: 15, fps: 25, bitrate_kbps: 2048, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cam05', camera_code: 'GJ-POL-CAM05', name: 'Visat Teen Rasta Highway Junction', department_id: 'HOME-POLICE', department_code: 'HOME-POLICE', department_name: 'Gujarat Police State Grid', location: { lat: 23.102, lon: 72.593 }, address: 'Sabarmati, Ahmedabad', vendor: 'Gujarat Certified', model: 'H.265', source_type: 'DIRECT_RTSP', protocol: 'RTSP', status: 'ONLINE', analytics_profile: 'ANPR', retention_days: 15, fps: 25, bitrate_kbps: 2048, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cam06', camera_code: 'GJ-POL-CAM06', name: 'Timbavadi Gate Checkpost, Junagadh', department_id: 'HOME-POLICE', department_code: 'HOME-POLICE', department_name: 'Gujarat Police State Grid', location: { lat: 21.52, lon: 70.45 }, address: 'Junagadh District', vendor: 'Gujarat Certified', model: 'H.264', source_type: 'DIRECT_RTSP', protocol: 'RTSP', status: 'ONLINE', analytics_profile: 'ANPR', retention_days: 15, fps: 25, bitrate_kbps: 2048, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cam07', camera_code: 'GJ-POL-CAM07', name: 'Hero Showroom Highway Point, Somnath', department_id: 'HOME-POLICE', department_code: 'HOME-POLICE', department_name: 'Gujarat Police State Grid', location: { lat: 20.9, lon: 70.36 }, address: 'Gir Somnath', vendor: 'Gujarat Certified', model: 'H.264', source_type: 'DIRECT_RTSP', protocol: 'RTSP', status: 'ONLINE', analytics_profile: 'ANPR', retention_days: 15, fps: 25, bitrate_kbps: 2048, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cam08', camera_code: 'GJ-POL-CAM08', name: 'Majewadi Gate Police Checkpost', department_id: 'HOME-POLICE', department_code: 'HOME-POLICE', department_name: 'Gujarat Police State Grid', location: { lat: 21.53, lon: 70.46 }, address: 'Junagadh', vendor: 'Gujarat Certified', model: 'H.264', source_type: 'DIRECT_RTSP', protocol: 'RTSP', status: 'ONLINE', analytics_profile: 'ANPR', retention_days: 15, fps: 25, bitrate_kbps: 2048, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cam09', camera_code: 'GJ-POL-CAM09', name: 'New Bypass Circle 2, Junagadh', department_id: 'HOME-POLICE', department_code: 'HOME-POLICE', department_name: 'Gujarat Police State Grid', location: { lat: 21.515, lon: 70.44 }, address: 'Junagadh', vendor: 'Gujarat Certified', model: 'H.264', source_type: 'DIRECT_RTSP', protocol: 'RTSP', status: 'ONLINE', analytics_profile: 'ANPR', retention_days: 15, fps: 25, bitrate_kbps: 2048, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cam10', camera_code: 'GJ-POL-CAM10', name: 'Char Chowk Road 2, Junagadh', department_id: 'HOME-POLICE', department_code: 'HOME-POLICE', department_name: 'Gujarat Police State Grid', location: { lat: 21.525, lon: 70.455 }, address: 'Junagadh City', vendor: 'Gujarat Certified', model: 'H.264', source_type: 'DIRECT_RTSP', protocol: 'RTSP', status: 'ONLINE', analytics_profile: 'ANPR', retention_days: 15, fps: 25, bitrate_kbps: 2048, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cam11', camera_code: 'GJ-POL-CAM11', name: 'Dolatpara Industrial Junction', department_id: 'HOME-POLICE', department_code: 'HOME-POLICE', department_name: 'Gujarat Police State Grid', location: { lat: 21.55, lon: 70.47 }, address: 'Junagadh', vendor: 'Gujarat Certified', model: 'H.264', source_type: 'DIRECT_RTSP', protocol: 'RTSP', status: 'ONLINE', analytics_profile: 'ANPR', retention_days: 15, fps: 25, bitrate_kbps: 2048, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cam12', camera_code: 'GJ-POL-CAM12', name: 'Tri Mandir Adalaj Tollnaka', department_id: 'HOME-POLICE', department_code: 'HOME-POLICE', department_name: 'Gujarat Police State Grid', location: { lat: 23.17, lon: 72.58 }, address: 'Gandhinagar Highway', vendor: 'Gujarat Certified', model: 'H.265', source_type: 'DIRECT_RTSP', protocol: 'RTSP', status: 'ONLINE', analytics_profile: 'ANPR', retention_days: 15, fps: 25, bitrate_kbps: 2048, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cam13', camera_code: 'GJ-POL-CAM13', name: 'C.N. Vidhyalaya Crossroad, Ambawadi', department_id: 'HOME-POLICE', department_code: 'HOME-POLICE', department_name: 'Gujarat Police State Grid', location: { lat: 23.023, lon: 72.55 }, address: 'Ambawadi, Ahmedabad', vendor: 'Gujarat Certified', model: 'H.264', source_type: 'DIRECT_RTSP', protocol: 'RTSP', status: 'ONLINE', analytics_profile: 'ANPR', retention_days: 15, fps: 25, bitrate_kbps: 2048, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cam14', camera_code: 'GJ-POL-CAM14', name: 'Delight RLVD Intersection', department_id: 'HOME-POLICE', department_code: 'HOME-POLICE', department_name: 'Gujarat Police State Grid', location: { lat: 23.03, lon: 72.54 }, address: 'Ahmedabad City', vendor: 'Gujarat Certified', model: 'H.264', source_type: 'DIRECT_RTSP', protocol: 'RTSP', status: 'ONLINE', analytics_profile: 'ANPR', retention_days: 15, fps: 25, bitrate_kbps: 2048, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cam15', camera_code: 'GJ-POL-CAM15', name: 'Suvidha Park Junction', department_id: 'HOME-POLICE', department_code: 'HOME-POLICE', department_name: 'Gujarat Police State Grid', location: { lat: 23.045, lon: 72.535 }, address: 'Ahmedabad City', vendor: 'Gujarat Certified', model: 'H.264', source_type: 'DIRECT_RTSP', protocol: 'RTSP', status: 'ONLINE', analytics_profile: 'ANPR', retention_days: 15, fps: 25, bitrate_kbps: 2048, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'cam16', camera_code: 'GJ-POL-CAM16', name: 'Visat P2 Highway Checkpost', department_id: 'HOME-POLICE', department_code: 'HOME-POLICE', department_name: 'Gujarat Police State Grid', location: { lat: 23.103, lon: 72.594 }, address: 'Gandhinagar Corridor', vendor: 'Gujarat Certified', model: 'H.264', source_type: 'DIRECT_RTSP', protocol: 'RTSP', status: 'ONLINE', analytics_profile: 'ANPR', retention_days: 15, fps: 25, bitrate_kbps: 2048, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
];

export const LiveViewMatrixView: React.FC = () => {
  const [cameras, setCameras] = useState<Camera[]>(FALLBACK_SENTINEL_CAMERAS);
  const [loading, setLoading] = useState<boolean>(true);
  const [pickerOpen, setPickerOpen] = useState<boolean>(false);
  const [inspectCamera, setInspectCamera] = useState<Camera | null>(null);
  const [search, setSearch] = useState<string>('');
  const [deptFilter, setDeptFilter] = useState<string>('ALL');
  const [activeAnomalies, setActiveAnomalies] = useState<Record<string, { type: string; severity: string; description?: string }>>({});
  const { addLiveAlert } = useAlertStore();

  // Draggable Floating Inspection Deck state
  const [deckPos, setDeckPos] = useState<{ x: number; y: number }>({ x: 80, y: 70 });
  const [isDraggingDeck, setIsDraggingDeck] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [deckMinimized, setDeckMinimized] = useState<boolean>(false);
  const deckRef = useRef<HTMLDivElement>(null);

  const layouts: GridLayout[] = ['1x1', '2x2', '3x3', '1+5', '4x4', '5x5', '6x6', '50-GRID'];

  const { 
    layout, 
    setLayout, 
    slots, 
    assignCameraToSlot, 
    populateAllCameras,
    selectedSlotIndex, 
    setSelectedSlotIndex, 
    clearWall 
  } = useVideoWallStore();

  // Subscribe to real-time anomaly events and alerts
  useEffect(() => {
    const unsubAlerts = wsManager.subscribe('alerts', (msg) => {
      const payload = msg.payload;
      if (!payload) return;
      
      // If it's an anomaly alert, update activeAnomalies map
      if (payload.watchlist_category === 'TRAFFIC_ANOMALY' || payload.entity_identifier?.includes('ANOMALY') || payload.notes?.includes('Anomaly')) {
        const camKey = payload.camera_id || payload.camera_code;
        if (camKey) {
          setActiveAnomalies((prev) => ({
            ...prev,
            [camKey]: {
              type: payload.entity_identifier || 'TRAFFIC_ANOMALY',
              severity: payload.severity || 'CRITICAL',
              description: payload.notes,
            }
          }));

          // Clear anomaly after 30 seconds
          setTimeout(() => {
            setActiveAnomalies((prev) => {
              const updated = { ...prev };
              delete updated[camKey];
              return updated;
            });
          }, 30000);
        }
      }
      
      // Also register into alert store
      if (payload.id) {
        addLiveAlert(payload);
      }
    });

    const unsubAnomaly = wsManager.subscribe('anomaly.events', (msg) => {
      const payload = msg.payload;
      if (!payload) return;
      const camKey = payload.camera_id;
      if (camKey) {
        setActiveAnomalies((prev) => ({
          ...prev,
          [camKey]: {
            type: payload.identifier?.normalized || 'TRAFFIC_ANOMALY',
            severity: payload.pipeline?.inference_tier || 'CRITICAL',
            description: payload.identifier?.raw,
          }
        }));

        setTimeout(() => {
          setActiveAnomalies((prev) => {
            const updated = { ...prev };
            delete updated[camKey];
            return updated;
          });
        }, 30000);
      }
    });

    return () => {
      unsubAlerts();
      unsubAnomaly();
    };
  }, [addLiveAlert]);

  useEffect(() => {
    async function loadCameras() {
      setLoading(true);
      let res: Camera[] = [];
      try {
        res = await camerasApi.getCameras({ limit: 100 });
      } catch (err) {
        console.warn('Falling back to /api/ingest catalog:', err);
      }

      if (!res || res.length === 0) {
        try {
          const catalogRes = await sentinelApi.getIngestCatalog();
          if (catalogRes?.catalogue && catalogRes.catalogue.length > 0) {
            res = catalogRes.catalogue.map((c: IngestCameraItem): Camera => ({
              id: c.id,
              camera_code: c.camera_code,
              name: c.name,
              department_id: c.department_code,
              department_code: c.department_code,
              department_name: c.department_name,
              location: { lat: c.latitude, lon: c.longitude },
              address: c.address,
              vendor: 'Gujarat Government Certified',
              model: 'DS-2CD-GujaratSentinel',
              source_type: 'DIRECT_RTSP',
              status: (c.live_status as any) || 'ONLINE',
              protocol: 'RTSP',
              analytics_profile: 'ANPR',
              retention_days: 15,
              fps: 25,
              bitrate_kbps: 2048,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }));
          }
        } catch (catErr) {
          console.error('Catalog fetch failed:', catErr);
        }
      }

      const finalCameras = (res && res.length > 0) ? res : FALLBACK_SENTINEL_CAMERAS;
      setCameras(finalCameras);
      setLoading(false);

      // Auto-fill empty slots atomically
      const currentActiveCount = Object.values(slots).filter(Boolean).length;
      if (currentActiveCount === 0 && finalCameras.length > 0) {
        populateAllCameras(finalCameras);
      }
    }

    loadCameras();
  }, [layout]);

  // Draggable floating window mouse listeners
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingDeck) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 380, e.clientX - dragOffset.x));
      const newY = Math.max(10, Math.min(window.innerHeight - 150, e.clientY - dragOffset.y));
      setDeckPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDraggingDeck) {
        setIsDraggingDeck(false);
      }
    };

    if (isDraggingDeck) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingDeck, dragOffset]);

  const handleAutoFill = () => {
    if (cameras.length === 0) return;
    populateAllCameras(cameras);
  };

  const handlePopulateAll50 = () => {
    setLayout('50-GRID');
    populateAllCameras(cameras);
  };

  const activeSlotCount = Object.values(slots).filter(Boolean).length;
  const totalSlots = getLayoutSlotCount(layout);

  const departments = ['ALL', 'HOME-POLICE', 'GSRTC', 'HEALTH', 'PANCHAYAT', 'MUNICIPAL'];

  const filteredCameras = cameras.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.camera_code.toLowerCase().includes(search.toLowerCase()) ||
      (c.address && c.address.toLowerCase().includes(search.toLowerCase()));

    const dept = (c as any).department_code || c.department_id || '';
    const matchesDept = deptFilter === 'ALL' || dept.includes(deptFilter) || (c.department_name && c.department_name.includes(deptFilter));

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-3 h-[calc(100vh-8.5rem)] flex flex-col select-none relative">
      {/* Top Controls Glass Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#0a0f1d]/90 backdrop-blur-md rounded-2xl border border-slate-800/90 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-inner">
            <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>
          <div>
            <div className="text-sm font-black font-mono text-white tracking-wider uppercase flex items-center gap-2">
              Tactical Video Wall Matrix
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/40">
                {layout === '50-GRID' ? '50 CHANNELS SIMULTANEOUS' : `${layout} MATRIX`}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <Activity className="w-3.5 h-3.5 animate-pulse" />
                {activeSlotCount}/{totalSlots} Active Feeds
              </span>
              <span className="text-slate-600">•</span>
              <span>{cameras.length} Government Nodes Available</span>
              <span className="text-slate-600">•</span>
              <span className="text-cyan-400 font-medium">H.264/H.265 Direct Relay</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400/90 font-medium flex items-center gap-1">
                <Move className="w-3 h-3" /> Draggable Grid
              </span>
            </div>
          </div>
        </div>

        {/* Layout Switcher Pills */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 overflow-x-auto shadow-inner">
          {layouts.map((l) => (
            <button
              key={l}
              onClick={() => {
                setLayout(l);
                if (l === '50-GRID') {
                  handlePopulateAll50();
                }
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all shrink-0 ${
                layout === l
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-glow-cyan'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {l === '50-GRID' ? '50 ALL' : l}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            icon={<Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
            onClick={handleAutoFill}
            title="Auto-fill all empty slots with active surveillance cameras"
          >
            Auto-Fill Grid
          </Button>

          <Button
            size="sm"
            variant="primary"
            icon={<Radio className="w-3.5 h-3.5" />}
            onClick={handlePopulateAll50}
          >
            Show All 50
          </Button>

          <Button
            size="sm"
            variant="secondary"
            icon={<CameraIcon className="w-3.5 h-3.5 text-cyan-400" />}
            onClick={() => setPickerOpen(true)}
          >
            Assign Feed
          </Button>

          <Button
            size="sm"
            variant="ghost"
            icon={<Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-rose-400" />}
            onClick={clearWall}
            title="Clear all cameras from video wall"
          >
            Clear Wall
          </Button>
        </div>
      </div>

      {/* Multi-Grid Matrix with Drag-and-Drop */}
      <div className="flex-1 w-full min-h-0">
        <VideoWallGrid 
          activeAnomalies={activeAnomalies}
          onSlotClick={(index) => {
            setSelectedSlotIndex(index);
            if (!slots[index]) {
              setPickerOpen(true);
            } else {
              setInspectCamera(slots[index]);
              setDeckMinimized(false);
            }
          }}
          onInspectCamera={(camera) => {
            setInspectCamera(camera);
            setDeckMinimized(false);
          }}
        />
      </div>

      {/* Camera Selection Drawer with Draggable Camera Cards */}
      <Drawer
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title={`Assign Surveillance Node to Slot ${selectedSlotIndex + 1}`}
        subtitle="Click to assign, or drag any camera card directly onto any slot in the wall"
        width="md"
      >
        <div className="space-y-3">
          {/* Department Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
            {departments.map((d) => (
              <button
                key={d}
                onClick={() => setDeptFilter(d)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap transition-all ${
                  deptFilter === d
                    ? 'bg-cyan-600 text-white shadow-glow-cyan'
                    : 'bg-slate-900/80 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {d === 'ALL' ? 'ALL DEPARTMENTS' : d}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search cameras by code, junction, district..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="text-[11px] font-mono text-cyan-400/90 flex items-center gap-1 bg-cyan-950/40 p-2 rounded-lg border border-cyan-500/20">
            <GripVertical className="w-3.5 h-3.5" />
            <span>Tip: Drag any card into a grid slot, or click to assign to selected Slot {selectedSlotIndex + 1}</span>
          </div>

          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar">
            {filteredCameras.map((cam) => {
              const isAssigned = Object.values(slots).some((s) => s?.id === cam.id);
              return (
                <div
                  key={cam.id}
                  draggable={true}
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'camera', camera: cam }));
                    e.dataTransfer.effectAllowed = 'copyMove';
                  }}
                  onClick={() => {
                    assignCameraToSlot(selectedSlotIndex, cam);
                    setPickerOpen(false);
                  }}
                  className={`p-3 bg-slate-900/80 hover:bg-cyan-950/40 border rounded-xl cursor-grab active:cursor-grabbing transition-all flex items-center justify-between group ${
                    isAssigned ? 'border-cyan-500/40 bg-cyan-950/20' : 'border-slate-800 hover:border-cyan-500/50'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 shrink-0" />
                      <span className="font-mono text-xs font-bold text-cyan-400">{cam.camera_code}</span>
                      {isAssigned && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                          ON WALL
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-white mt-0.5 truncate pl-5">{cam.name}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate pl-5">
                      <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{cam.address || 'Ahmedabad, Gujarat'}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                        cam.status === 'ONLINE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {cam.status}
                    </span>
                    <span className="text-[9px] font-mono text-slate-500">25 FPS TCP</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Drawer>

      {/* DRAGGABLE FLOATING TACTICAL INSPECTION DECK */}
      {inspectCamera && (
        <div
          ref={deckRef}
          style={{
            position: 'fixed',
            left: `${deckPos.x}px`,
            top: `${deckPos.y}px`,
            zIndex: 60,
          }}
          className={`bg-navy-950 border border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col transition-shadow duration-150 animate-in fade-in zoom-in-95 ${
            deckMinimized ? 'w-80 h-auto' : 'w-[90vw] max-w-4xl max-h-[85vh]'
          } ${isDraggingDeck ? 'shadow-glow-cyan ring-2 ring-cyan-400/60' : 'shadow-2xl'}`}
        >
          {/* Draggable Header Bar */}
          <div
            onMouseDown={(e) => {
              if ((e.target as HTMLElement).closest('button')) return;
              e.preventDefault();
              setIsDraggingDeck(true);
              setDragOffset({
                x: e.clientX - deckPos.x,
                y: e.clientY - deckPos.y,
              });
            }}
            className="flex items-center justify-between px-3.5 py-2.5 bg-navy-900 border-b border-navy-800 cursor-move select-none group"
            title="Drag to reposition window anywhere on the screen"
          >
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <div className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shrink-0">
                <Move className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-black font-mono text-white tracking-wider uppercase truncate flex items-center gap-1.5">
                  <span className="text-cyan-400">{inspectCamera.camera_code}</span>
                  <span className="text-slate-500">•</span>
                  <span className="truncate">{inspectCamera.name}</span>
                </div>
                {!deckMinimized && (
                  <div className="text-[9px] font-mono text-slate-400 truncate">
                    <span>{inspectCamera.department_name || 'Home Department (Gujarat Police)'}</span>
                    <span> &bull; </span>
                    <span className="text-slate-500">HOLD & DRAG TITLEBAR TO REPOSITION</span>
                  </div>
                )}
              </div>
            </div>

            {/* Window Controls: Minimize, Maximize/Restore, Close */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setDeckMinimized(!deckMinimized)}
                className="p-1.5 rounded-lg bg-navy-800 hover:bg-cyan-600 text-slate-300 hover:text-white transition-colors"
                title={deckMinimized ? 'Expand Deck' : 'Minimize to Mini-Player'}
              >
                {deckMinimized ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
              </button>

              <button
                onClick={() => setInspectCamera(null)}
                className="p-1.5 rounded-lg bg-navy-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
                title="Close Inspection Deck"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body Video Player */}
          <div className={`bg-black ${deckMinimized ? 'h-44' : 'flex-1 min-h-[360px] max-h-[520px]'}`}>
            <LiveVideoPlayer
              camera={inspectCamera}
              compact={deckMinimized}
              detectedPlate="GJ01AB1234"
              confidence={98.2}
              adaptiveMode="critical"
              activeAnomaly={inspectCamera ? (activeAnomalies[inspectCamera.id] || activeAnomalies[inspectCamera.camera_code]) : undefined}
            />
          </div>

          {/* Footer Telemetry Details (hidden when minimized) */}
          {!deckMinimized && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 bg-navy-900/95 border-t border-navy-800 text-[11px] font-mono">
              <div className="flex items-center gap-3 text-slate-400 truncate">
                <div><span className="text-slate-500">RELAY:</span> <span className="text-emerald-400 font-bold">WHEP / MJPEG 25 FPS</span></div>
                <div><span className="text-slate-500">ANPR:</span> <span className="text-yellow-400 font-bold">HOTLIST SCAN ACTIVE</span></div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setInspectCamera(null)}
                >
                  Close Inspection
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

