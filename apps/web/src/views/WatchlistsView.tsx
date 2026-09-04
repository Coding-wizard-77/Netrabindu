import React, { useState, useEffect } from 'react';
import { WatchlistEntity, WatchlistCategory } from '../types';
import { watchlistsApi } from '../api/watchlists';
import { DataTable, Column } from '../components/common/DataTable';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { ListOrdered, Plus, Search, CheckCircle, ShieldCheck, Activity } from 'lucide-react';
import { formatToIST } from '../utils/date';
import { normalizeLicensePlate } from '../utils/normalizer';

export const WatchlistsView: React.FC = () => {
  const [entities, setEntities] = useState<WatchlistEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [matchModalOpen, setMatchModalOpen] = useState(false);

  // Form State
  const [form, setForm] = useState({
    identifier: '',
    category: 'STOLEN_VEHICLE',
    priority: 'CRITICAL',
    source_ref: 'FIR-2026-AHM-04',
    notes: '',
  });

  // Diagnostic Match State
  const [diagInput, setDiagInput] = useState('');
  const [diagResult, setDiagResult] = useState<any>(null);
  const [diagLoading, setDiagLoading] = useState(false);

  const fetchWatchlists = async () => {
    try {
      setLoading(true);
      const res = await watchlistsApi.getWatchlists();
      setEntities(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWatchlists();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await watchlistsApi.createWatchlistEntity({
      entity_type: 'VEHICLE',
      identifier: form.identifier,
      normalized_identifier: normalizeLicensePlate(form.identifier),
      category: form.category as WatchlistCategory,
      priority: form.priority as any,
      source_ref: form.source_ref,
      notes: form.notes,
      status: 'ACTIVE',
    });
    setCreateModalOpen(false);
    fetchWatchlists();
  };

  const handleRunDiagnostic = async () => {
    if (!diagInput) return;
    try {
      setDiagLoading(true);
      const res = await watchlistsApi.matchCandidateDiagnostic({
        identifier: normalizeLicensePlate(diagInput),
      });
      setDiagResult(res);
    } finally {
      setDiagLoading(false);
    }
  };

  const columns: Column<WatchlistEntity>[] = [
    {
      key: 'identifier',
      header: 'Target Identifier / Plate',
      sortable: true,
      render: (w) => <span className="font-mono font-bold text-white text-sm">{w.identifier}</span>,
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (w) => <span className="font-mono text-cyan-400">{w.category}</span>,
    },
    {
      key: 'priority',
      header: 'Priority',
      sortable: true,
      render: (w) => <Badge variant="severity" value={w.priority} />,
    },
    {
      key: 'source_ref',
      header: 'Reference (FIR / eGujCop)',
      render: (w) => <span className="font-mono text-slate-400">{w.source_ref || '--'}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (w) => <Badge variant="status" value={w.status === 'ACTIVE' ? 'ONLINE' : 'OFFLINE'} />,
    },
    {
      key: 'created_at',
      header: 'Created (IST)',
      sortable: true,
      render: (w) => <span className="font-mono">{formatToIST(w.created_at, 'dd MMM yyyy')}</span>,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-cyan-400" />
            Watchlist Target Registry
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Stolen vehicles, suspect tracking, and fuzzy candidate matching
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            icon={<Activity className="w-3.5 h-3.5" />}
            onClick={() => setMatchModalOpen(true)}
          >
            Diagnostic Matcher
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setCreateModalOpen(true)}
          >
            Add Watchlist Target
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={entities}
        keyExtractor={(w) => w.id}
        isLoading={loading}
        searchPlaceholder="Filter targets by plate, FIR ref, category..."
      />

      {/* Create Target Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Add Target to Watchlist"
        subtitle="Registers vehicle or person target for automated correlation"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs font-mono">
          <div>
            <label className="text-slate-400 block mb-1">Target License Plate / ID</label>
            <input
              type="text"
              required
              placeholder="e.g. GJ 01 AB 1234"
              value={form.identifier}
              onChange={(e) => setForm({ ...form, identifier: e.target.value.toUpperCase() })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-white font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Category</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
              >
                <option value="STOLEN_VEHICLE">Stolen Vehicle</option>
                <option value="WANTED_SUSPECT">Wanted Suspect</option>
                <option value="TRAFFIC_OFFENDER">Traffic Offender</option>
                <option value="VIP_ESCORT">VIP Escort</option>
                <option value="SURVEILLANCE">Surveillance</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Source Reference (FIR / eGujCop)</label>
            <input
              type="text"
              value={form.source_ref}
              onChange={(e) => setForm({ ...form, source_ref: e.target.value })}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <Button type="submit" variant="primary">
              Register Target
            </Button>
          </div>
        </form>
      </Modal>

      {/* Diagnostic Matcher Modal */}
      <Modal
        isOpen={matchModalOpen}
        onClose={() => setMatchModalOpen(false)}
        title="Watchlist Candidate Diagnostic Tool"
        subtitle="Simulate candidate retrieval and bounded fuzzy string distance"
      >
        <div className="space-y-4 text-xs font-mono">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Enter probe plate (e.g. GJ01AB1234)..."
              value={diagInput}
              onChange={(e) => setDiagInput(e.target.value.toUpperCase())}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
            />
            <Button variant="primary" onClick={handleRunDiagnostic} loading={diagLoading}>
              Test Match
            </Button>
          </div>

          {diagResult && (
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <h5 className="font-bold text-white">Diagnostic Results:</h5>
              {diagResult.matches?.length === 0 ? (
                <p className="text-slate-500">No candidate matches found in database.</p>
              ) : (
                diagResult.matches?.map((m: any) => (
                  <div key={m.entity_id} className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between">
                    <div>
                      <strong className="text-cyan-400">{m.identifier}</strong> ({m.category})
                    </div>
                    <div className="text-emerald-400 font-bold">
                      {(m.similarity_score * 100).toFixed(1)}% Match
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};
