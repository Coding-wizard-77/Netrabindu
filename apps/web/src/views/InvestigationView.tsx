import React, { useState } from 'react';
import { VehicleRouteResponse, VehicleRoutePoint } from '../types';
import { vehiclesApi } from '../api/vehicles';
import { PlateSearchHeader } from '../components/investigation/PlateSearchHeader';
import { VehicleTimeline } from '../components/investigation/VehicleTimeline';
import { RouteMapSynchronizer } from '../components/investigation/RouteMapSynchronizer';
import { InvestigationReportExport } from '../components/investigation/InvestigationReportExport';
import { Search, MapPin, AlertCircle, FileText } from 'lucide-react';

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
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Search className="w-5 h-5 text-cyan-400" />
          Vehicle Investigation &amp; GIS Route Reconstruction
        </h1>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Observed-only camera chronologies • Explicit unobserved gap identification
        </p>
      </div>

      {/* Search Header Form */}
      <PlateSearchHeader onSearch={handleSearch} loading={loading} />

      {error && (
        <div className="p-4 bg-rose-950/20 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-mono flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          {error}
        </div>
      )}

      {routeData && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => setShowReport(!showReport)}
              className="text-xs font-mono text-cyan-400 hover:underline flex items-center gap-1"
            >
              <FileText className="w-3.5 h-3.5" />
              {showReport ? 'Hide Dossier Preview' : 'Show Dossier Preview'}
            </button>
          </div>

          {showReport && <InvestigationReportExport routeData={routeData} />}

          {/* Synchronized GIS Route Map & Chronological Timeline */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="p-4 bg-[#0f172a] rounded-xl border border-slate-800 max-h-[700px] overflow-y-auto">
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
        <div className="p-16 text-center text-xs font-mono text-slate-500 bg-slate-900/20 rounded-xl border border-dashed border-slate-800">
          Enter a target license plate number above to reconstruct observed movement history.
        </div>
      )}
    </div>
  );
};
