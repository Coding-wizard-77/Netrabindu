import React, { useState, useEffect } from 'react';
import { DetectionEvent } from '../../types';
import { ANPREventCard } from './ANPREventCard';
import { CropInspectorModal } from './CropInspectorModal';
import { wsManager } from '../../api/websocket';
import { Radio, Pause, Play, Trash2 } from 'lucide-react';
import { Button } from '../common/Button';

interface LiveEventStreamProps {
  initialEvents?: DetectionEvent[];
  maxEvents?: number;
}

export const LiveEventStream: React.FC<LiveEventStreamProps> = ({
  initialEvents = [],
  maxEvents = 30,
}) => {
  const [events, setEvents] = useState<DetectionEvent[]>(initialEvents);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<DetectionEvent | null>(null);

  useEffect(() => {
    if (initialEvents.length > 0 && events.length === 0) {
      setEvents(initialEvents);
    }
  }, [initialEvents]);

  useEffect(() => {
    const unsub = wsManager.subscribe('anpr.events', (msg) => {
      if (!isPaused && msg.payload) {
        setEvents((prev) => [msg.payload, ...prev.slice(0, maxEvents - 1)]);
      }
    });

    return () => {
      unsub();
    };
  }, [isPaused, maxEvents]);

  return (
    <div className="space-y-3">
      {/* Stream Controls */}
      <div className="flex items-center justify-between p-3 bg-white/90 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-500 dark:text-cyan-400 animate-pulse" />
          <span className="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 uppercase tracking-wider">
            Live Intelligence Stream
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
            {events.length} Events
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            icon={isPaused ? <Play className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />}
            onClick={() => setIsPaused(!isPaused)}
          >
            {isPaused ? 'Resume' : 'Pause'}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            icon={<Trash2 className="w-3.5 h-3.5" />}
            onClick={() => setEvents([])}
          >
            Clear
          </Button>
        </div>
      </div>

      {/* Grid of Detection Cards */}
      {events.length === 0 ? (
        <div className="p-12 text-center text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20 rounded-xl border border-dashed border-slate-300 dark:border-slate-800">
          Awaiting real-time detections from Edge AI pipeline...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {events.map((evt) => (
            <ANPREventCard
              key={evt.event_id}
              event={evt}
              onInspect={(e) => setSelectedEvent(e)}
            />
          ))}
        </div>
      )}

      {/* Inspector Modal */}
      <CropInspectorModal
        event={selectedEvent}
        isOpen={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
      />
    </div>
  );
};
