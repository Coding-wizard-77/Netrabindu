import React from 'react';
import { VehicleRouteResponse } from '../../types';
import { formatToIST } from '../../utils/date';
import { formatLicensePlateDisplay } from '../../utils/normalizer';
import { Printer, Download, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';

interface InvestigationReportExportProps {
  routeData: VehicleRouteResponse;
}

export const InvestigationReportExport: React.FC<InvestigationReportExportProps> = ({
  routeData,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between no-print">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
          Investigation Dossier Preview
        </h4>
        <Button
          variant="tactical"
          size="sm"
          icon={<Printer className="w-3.5 h-3.5" />}
          onClick={handlePrint}
        >
          Print / Export PDF Dossier
        </Button>
      </div>

      {/* Printable Report View */}
      <div className="p-6 bg-slate-900 rounded-xl border border-slate-800 text-slate-200 font-mono space-y-4 print:bg-white print:text-black print:border-none">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold tracking-wider text-white print:text-black">
              GUJARAT POLICE SURVEILLANCE &amp; INVESTIGATION REPORT
            </h2>
            <p className="text-xs text-slate-400 print:text-gray-600">
              Generated under statutory authorization — Department of Home Affairs
            </p>
          </div>
          <div className="text-right text-xs">
            <div>Report Ref: NB-INV-{Date.now().toString().slice(-6)}</div>
            <div>Date: {formatToIST(new Date().toISOString())}</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950 p-3 rounded-lg print:bg-gray-100">
          <div>
            <span className="text-slate-500">Target Plate:</span>{' '}
            <strong className="text-white print:text-black">
              {formatLicensePlateDisplay(routeData.normalized_plate)}
            </strong>
          </div>
          <div>
            <span className="text-slate-500">Total Sightings:</span>{' '}
            <strong className="text-cyan-400 print:text-black">{routeData.total_sightings}</strong>
          </div>
          <div>
            <span className="text-slate-500">Unique Cameras:</span>{' '}
            <strong className="text-emerald-400 print:text-black">{routeData.unique_cameras}</strong>
          </div>
          <div>
            <span className="text-slate-500">Search Window:</span>{' '}
            <strong>{formatToIST(routeData.from_time, 'dd/MM HH:mm')}</strong>
          </div>
        </div>

        {/* Observed Points Summary Table */}
        <table className="w-full text-left text-xs border border-slate-800 print:border-gray-300">
          <thead className="bg-slate-950 text-slate-400 print:bg-gray-200 print:text-black">
            <tr>
              <th className="p-2 border-b border-slate-800">#</th>
              <th className="p-2 border-b border-slate-800">Time (IST)</th>
              <th className="p-2 border-b border-slate-800">Camera / Location</th>
              <th className="p-2 border-b border-slate-800">Department</th>
              <th className="p-2 border-b border-slate-800">Coordinates</th>
              <th className="p-2 border-b border-slate-800">Confidence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 print:divide-gray-200">
            {routeData.points.map((pt) => (
              <tr key={pt.sequence}>
                <td className="p-2">{pt.sequence}</td>
                <td className="p-2 font-bold">{formatToIST(pt.occurred_at, 'dd MMM, HH:mm:ss')}</td>
                <td className="p-2">{pt.camera_name}</td>
                <td className="p-2">{pt.department_name}</td>
                <td className="p-2 font-mono">
                  {pt.location.lat.toFixed(4)}, {pt.location.lon.toFixed(4)}
                </td>
                <td className="p-2 font-bold text-emerald-400 print:text-black">
                  {(pt.confidence * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 print:text-gray-600">
          <span>Observed points only. Unobserved routes between cameras remain unverified.</span>
          <span>Signature of Investigating Officer: _______________________</span>
        </div>
      </div>
    </div>
  );
};
