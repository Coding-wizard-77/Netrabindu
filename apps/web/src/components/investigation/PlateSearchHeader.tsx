import React, { useState } from 'react';
import { Search, Calendar, Filter } from 'lucide-react';
import { Button } from '../common/Button';
import { normalizeLicensePlate } from '../../utils/normalizer';

interface PlateSearchHeaderProps {
  onSearch: (plate: string, from?: string, to?: string) => void;
  loading?: boolean;
}

export const PlateSearchHeader: React.FC<PlateSearchHeaderProps> = ({ onSearch, loading }) => {
  const [plate, setPlate] = useState('');
  const [fromTime, setFromTime] = useState('');
  const [toTime, setToTime] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = normalizeLicensePlate(plate);
    if (normalized) {
      onSearch(normalized, fromTime || undefined, toTime || undefined);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 bg-[#0f172a] border border-slate-800 rounded-xl shadow-xl space-y-3"
    >
      <div className="flex flex-col md:flex-row items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 w-full">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
          <input
            type="text"
            required
            placeholder="Search Target License Plate (e.g. GJ 01 AB 1234)..."
            value={plate}
            onChange={(e) => setPlate(e.target.value.toUpperCase())}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 tracking-wider"
          />
        </div>

        {/* Date Filters */}
        <div className="flex items-center gap-2 w-full md:w-auto font-mono text-xs text-slate-400">
          <input
            type="datetime-local"
            value={fromTime}
            onChange={(e) => setFromTime(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200"
            title="Start Window"
          />
          <span>to</span>
          <input
            type="datetime-local"
            value={toTime}
            onChange={(e) => setToTime(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-slate-200"
            title="End Window"
          />
        </div>

        <Button type="submit" variant="primary" loading={loading} icon={<Search className="w-4 h-4" />}>
          Reconstruct Route
        </Button>
      </div>
    </form>
  );
};
