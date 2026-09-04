import React, { useState, useEffect } from 'react';
import { DetectionEvent } from '../types';
import { eventsApi } from '../api/events';
import { LiveEventStream } from '../components/anpr/LiveEventStream';
import { Search, Zap, Filter, RefreshCw } from 'lucide-react';
import { Button } from '../components/common/Button';

export const EventsView: React.FC = () => {
  const [initialEvents, setInitialEvents] = useState<DetectionEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [plateSearch, setPlateSearch] = useState('');

  const loadEvents = async () => {
    try {
      setLoading(true);
      const res = await eventsApi.getEvents({ search_plate: plateSearch || undefined, limit: 30 });
      setInitialEvents(res.items || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

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
            Normalized ANPR, OCR confidence scores, and rolling evidence buffers
          </p>
        </div>

        <Button variant="secondary" size="sm" icon={<RefreshCw className="w-3.5 h-3.5" />} onClick={loadEvents} loading={loading}>
          Refresh Detections
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 p-3 bg-[#0f172a] rounded-xl border border-slate-800">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by license plate (e.g. GJ01AB1234)..."
            value={plateSearch}
            onChange={(e) => setPlateSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder-slate-500"
          />
        </div>
        <Button size="sm" variant="primary" onClick={loadEvents}>
          Search
        </Button>
      </div>

      {/* Live Stream Streamer */}
      <LiveEventStream initialEvents={initialEvents} />
    </div>
  );
};
