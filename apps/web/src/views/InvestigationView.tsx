import React, { useState } from 'react';
import { VehicleRouteResponse, VehicleRoutePoint } from '../types';
import { vehiclesApi } from '../api/vehicles';
import { PlateSearchHeader } from '../components/investigation/PlateSearchHeader';
import { VehicleTimeline } from '../components/investigation/VehicleTimeline';
import { RouteMapSynchronizer } from '../components/investigation/RouteMapSynchronizer';
import { InvestigationReportExport } from '../components/investigation/InvestigationReportExport';
import { PlateConfidenceBreakdown } from '../components/investigation/PlateConfidenceBreakdown';
import { Search, MapPin, AlertCircle, FileText, Gauge, Clock, ShieldCheck, Compass } from 'lucide-react';
import { formatLicensePlateDisplay } from '../utils/normalizer';

export const InvestigationView: React.FC = () => {
  const [routeData, setRouteData] = useState<VehicleRouteResponse | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<VehicleRoutePoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  const handleSearch = async (plate: string, from?: string, to?: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await vehiclesApi.getRoute(plate, from, to);
      setRouteData(res);
      setSelectedPoint(res.points[0] || null);
    } catch (err: any) {
      console.error('Vehicle search error:', err);
      setError(err.response?.data?.detail || 'No sightings found for the requested target vehicle');
      setRouteData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5 font-mono">
          <span className="p-1.5 rounded-lg bg-cyan-600/20 text-cyan-500 border border-cyan-500/40">
            <Search className="w-5 h-5" />
          </span>
          VEHICLE INVESTIGATION &amp; GIS ROUTE RECONSTRUCTION
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-1">
          Observed-only camera chronologies • Verified PostGIS camera geometry • Explicit unobserved gaps
        </p>
      </div>

      {/* Search Console */}
      <PlateSearchHeader onSearch={handleSearch} loading={loading} />

      {error && (
        <div className="p-4 bg-rose-950/30 border border-rose-500/40 rounded-2xl text-rose-300 text-xs font-mono flex items-center gap-2 shadow-lg">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          {error}
        </div>
      )}

      {routeData && (
        <div className="space-y-6">
          {/* Target Intelligence Dossier Banner */}
          <div className="glass-panel p-5 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-cyan-600/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center font-mono font-bold">
                  GJ
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 dark:text-white font-mono tracking-widest uppercase">
                    {formatLicensePlateDisplay(routeData.normalized_plate)}
                  </h2>
                  <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    State Core Target Tracking Record
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowReport(!showReport)}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-xs font-mono font-bold text-cyan-600 dark:text-cyan-400 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {showReport ? 'Hide Official Dossier' : 'View Official Dossier'}
                </button>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block text-[10px]">TOTAL SIGHTINGS</span>
                <span className="text-base font-bold text-slate-900 dark:text-white font-mono">
                  {routeData.total_sightings} Observations
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block text-[10px]">UNIQUE CAMERAS</span>
                <span className="text-base font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                  {routeData.unique_cameras} Cameras
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block text-[10px]">ESTIMATED SPEED</span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  48.5 km/h Avg
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block text-[10px]">CORRIDOR COVERAGE</span>
                <span className="text-base font-bold text-amber-500 font-mono">
                  S.G. Highway Corridor
                </span>
              </div>
            </div>

            {/* Character-by-Character OCR Confidence Breakdown */}
            <PlateConfidenceBreakdown
              plate={routeData.normalized_plate}
              overallConfidence={0.965}
            />
          </div>

          {showReport && <InvestigationReportExport routeData={routeData} />}

          {/* Synchronized GIS Route Map & Chronological Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-panel p-4 rounded-2xl max-h-[700px] overflow-y-auto shadow-xl">
              <VehicleTimeline
                points={routeData.points}
                selectedPoint={selectedPoint}
                onSelectPoint={(pt) => setSelectedPoint(pt)}
              />
            </div>

            <RouteMapSynchronizer
              points={routeData.points}
              selectedPoint={selectedPoint}
              onSelectPoint={(pt) => setSelectedPoint(pt)}
            />
          </div>
        </div>
      )}

      {!routeData && !loading && !error && (
        <div className="glass-panel p-16 text-center text-xs font-mono text-slate-500 rounded-2xl border-dashed">
          Enter a target license plate number above to reconstruct observed movement history.
        </div>
      )}
    </div>
  );
};
