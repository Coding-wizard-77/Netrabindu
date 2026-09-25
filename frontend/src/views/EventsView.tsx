import React, { useState, useEffect } from 'react';
import { DetectionEvent } from '../types';
import { eventsApi } from '../api/events';
import { LiveEventStream } from '../components/anpr/LiveEventStream';
import { Search, Zap, RefreshCw, Crosshair, ShieldAlert, Sparkles, Car, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '../components/common/Button';

const WATCHLIST_TARGETS = [
  { plate: 'GJ01AB1234', label: 'Stolen Scorpio', level: 'DEFCON 1', color: 'border-red-500/40 text-red-400 bg-red-950/20' },
  { plate: 'GJ27XY9999', label: 'Hit & Run Suspect', level: 'PRIORITY', color: 'border-amber-500/40 text-amber-400 bg-amber-950/20' },
  { plate: 'GJ01CD5678', label: 'Narcotics Bolero', level: 'HIGH', color: 'border-cyan-500/40 text-cyan-400 bg-cyan-950/20' },
  { plate: 'GJ05JK4321', label: 'Surat BOLO Target', level: 'WATCH', color: 'border-purple-500/40 text-purple-400 bg-purple-950/20' },
];

export const EventsView: React.FC = () => {
  const [events, setEvents] = useState<DetectionEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [intercepting, setIntercepting] = useState(false);
  const [plateSearch, setPlateSearch] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const handleSearch = async (targetPlate?: string) => {
    const q = (targetPlate !== undefined ? targetPlate : plateSearch).trim().toUpperCase();
    if (!q) {
      // If empty query, load recent sightings
      try {
        setLoading(true);
        const res = await eventsApi.getEvents({ limit: 30 });
        setEvents(res.items || []);
        setActiveQuery('');
        setSearched(false);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      setLoading(true);
      setPlateSearch(q);
      setActiveQuery(q);
      setSearched(true);
      const res = await eventsApi.getEvents({ search_plate: q, limit: 30 });
      setEvents(res.items || []);
    } finally {
      setLoading(false);
    }
  };

  const handleIntercept = async (targetPlate?: string) => {
    const q = (targetPlate !== undefined ? targetPlate : plateSearch).trim().toUpperCase();
    if (!q || q.length < 4) {
      setNotification('Please enter a valid license plate (minimum 4 characters) to begin search.');
      setTimeout(() => setNotification(null), 4000);
      return;
    }

    try {
      setIntercepting(true);
      setPlateSearch(q);
      setActiveQuery(q);
      setSearched(true);
      setNotification(`Deploying Sentinel AI optical targeting for plate ${q} across 51 corridor nodes...`);
      
      const newEvent = await eventsApi.interceptPlate(q);
      setNotification(`Target vehicle ${q} intercepted at ${newEvent.camera_code}! Forensic evidence recorded.`);
      setTimeout(() => setNotification(null), 5000);

      // Re-fetch events for this plate
      const res = await eventsApi.getEvents({ search_plate: q, limit: 30 });
      setEvents(res.items.length > 0 ? res.items : [newEvent]);
    } catch (err: any) {
      setNotification(`AI Intercept failed: ${err.message || 'Stream timeout'}`);
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setIntercepting(false);
    }
  };

  const handleClear = () => {
    setPlateSearch('');
    setActiveQuery('');
    setSearched(false);
    setEvents([]);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            AI Detection Stream &amp; Evidence Log
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time Gujarat Police Sentinel ANPR, forensic evidence archive, and optical target acquisition
          </p>
        </div>

        <div className="flex items-center gap-2">
          {events.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => handleSearch(activeQuery)}
              loading={loading}
            >
              Refresh Detections
            </Button>
          )}
          {searched && (
            <Button variant="ghost" size="sm" onClick={handleClear}>
              Clear Search
            </Button>
          )}
        </div>
      </div>

      {/* Target Plate Search & Intercept Console */}
      <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-2">
            <Crosshair className="w-4 h-4 text-cyan-400 animate-spin-slow" />
            Sentinel Grid Target Plate Search &amp; Intercept
          </span>
          <span className="text-[11px] font-mono text-slate-500">
            51 Nodes Active Across 5 Departments
          </span>
        </div>

        {/* Input Bar & Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Indian Plate Styled Input */}
          <div className="relative flex-1 flex items-center bg-slate-950 border border-slate-700 rounded-lg overflow-hidden focus-within:border-cyan-500 transition-colors">
            <div className="bg-blue-900 text-white font-bold text-[10px] px-2 py-2 select-none border-r border-slate-700 flex items-center justify-center font-mono">
              IND
            </div>
            <input
              type="text"
              placeholder="ENTER TARGET NUMBER PLATE (E.G. GJ01AB1234, GJ27XY9999)..."
              value={plateSearch}
              onChange={(e) => setPlateSearch(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full bg-transparent px-3 py-2 text-xs font-mono font-bold text-white placeholder-slate-500 outline-none uppercase tracking-wider"
            />
            {plateSearch && (
              <button
                type="button"
                onClick={() => setPlateSearch('')}
                className="px-2.5 text-xs text-slate-400 hover:text-white"
              >
                ×
              </button>
            )}
          </div>

          {/* Action 1: Search Archive */}
          <Button
            size="md"
            variant="primary"
            icon={<Search className="w-4 h-4" />}
            onClick={() => handleSearch()}
            loading={loading}
          >
            Begin Search
          </Button>

          {/* Action 2: Active AI Intercept */}
          <Button
            size="md"
            variant="secondary"
            icon={<Sparkles className="w-4 h-4 text-amber-400" />}
            onClick={() => handleIntercept()}
            loading={intercepting}
            className="border-amber-500/30 text-amber-300 hover:bg-amber-950/30"
          >
            Deploy AI Intercept
          </Button>
        </div>

        {/* Quick Hotlist Target Selection */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 font-bold flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-red-400" /> Hotlist Targets:
          </span>
          {WATCHLIST_TARGETS.map((t) => (
            <button
              key={t.plate}
              type="button"
              onClick={() => {
                setPlateSearch(t.plate);
                handleIntercept(t.plate);
              }}
              className={`text-[11px] font-mono px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 ${t.color}`}
            >
              <span className="font-bold">{t.plate}</span>
              <span className="text-[9px] opacity-75">({t.label})</span>
            </button>
          ))}
        </div>

        {/* Live Notification Banner */}
        {notification && (
          <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{notification}</span>
          </div>
        )}
      </div>

      {/* Search Result Feedback */}
      {searched && (
        <div className="flex items-center justify-between p-3 bg-slate-900/60 rounded-xl border border-slate-800">
          <div className="flex items-center gap-2 text-xs font-mono">
            <Car className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Search Results for Target Plate:</span>
            <span className="text-white font-bold px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              {activeQuery}
            </span>
            <span className="text-slate-400">
              — {events.length} sighting{events.length === 1 ? '' : 's'} recorded
            </span>
          </div>

          {events.length === 0 && (
            <button
              type="button"
              onClick={() => handleIntercept(activeQuery)}
              className="text-xs font-mono text-amber-400 hover:text-amber-300 underline flex items-center gap-1 font-bold"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Scan Live Grid for {activeQuery} now
            </button>
          )}
        </div>
      )}

      {/* Detection Stream / Results */}
      {events.length === 0 && !searched ? (
        <div className="p-16 text-center space-y-3 bg-slate-900/20 rounded-2xl border border-dashed border-slate-800">
          <div className="w-12 h-12 rounded-full bg-cyan-950/40 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <Crosshair className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold font-mono text-slate-200 uppercase tracking-wider">
              Sentinel Optical Grid Standby
            </h3>
            <p className="text-xs font-mono text-slate-400 max-w-md mx-auto">
              Enter any vehicle license plate in the console above and click <span className="text-cyan-400 font-bold">"Begin Search"</span> to query the Section-65B archive, or click <span className="text-amber-400 font-bold">"Deploy AI Intercept"</span> to scan live corridor feeds.
            </p>
          </div>
        </div>
      ) : (
        <LiveEventStream initialEvents={events} />
      )}
    </div>
  );
};
