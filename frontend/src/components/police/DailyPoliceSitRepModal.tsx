import React from 'react';
import { X, Printer, FileText, Shield, TrendingUp, AlertTriangle, CheckCircle, Activity, Download } from 'lucide-react';
import { tacticalAudio } from '../../utils/audio';

interface DailyPoliceSitRepModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyPoliceSitRepModal: React.FC<DailyPoliceSitRepModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    tacticalAudio.playKeyClick();
    window.print();
  };

  const sitrepData = {
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
    totalScanned: '84,210',
    watchlistHits: '42',
    interceptionsConfirmed: '29',
    nakabandiDeployments: '3',
    avgPcrResponseTime: '4.8 mins',
    topHotspots: [
      { junction: 'SG Highway Chanakyapuri Chokdi', hits: 14, severity: 'HIGH' },
      { junction: 'SP Ring Road Bopal Toll Plaza', hits: 9, severity: 'MEDIUM' },
      { junction: 'Kalupur Railway Station Circle', hits: 8, severity: 'MEDIUM' },
      { junction: 'Geeta Mandir Central Bus Terminus', hits: 6, severity: 'LOW' },
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl rounded-xl border border-navy-700 bg-white text-slate-900 dark:bg-navy-950 dark:text-slate-100 p-8 shadow-2xl my-8">
        {/* Controls */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-4 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-accent-blue/10 p-2 text-accent-blue border border-accent-blue/20">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Gujarat Police 24-Hour Situation Report (SitRep)
                <span className="text-xs px-2 py-0.5 rounded bg-accent-blue/20 text-accent-cyan font-mono">
                  CLASSIFIED / RESTRICTED
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated daily operational summary generated for DGP / Commissioner of Police
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 rounded-lg bg-accent-blue px-3 py-1.5 text-xs font-bold text-white hover:bg-accent-blue/90 shadow transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Print SitRep</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="mt-6 space-y-6">
          {/* Header */}
          <div className="text-center border-b border-slate-300 dark:border-navy-800 pb-4">
            <div className="text-xs font-bold tracking-widest text-slate-500 uppercase">
              GUJARAT POLICE STATE COMMAND & CONTROL CENTRE
            </div>
            <h1 className="text-xl font-black text-slate-900 dark:text-white uppercase mt-1">
              DAILY OPERATIONAL SITUATION REPORT
            </h1>
            <div className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-1">
              REPORTING PERIOD: 00:00:00 TO 23:59:59 IST ({sitrepData.date})
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="rounded-lg border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-900 p-3 text-center">
              <div className="text-xs text-slate-500 font-semibold">Total ANPR Scans</div>
              <div className="text-2xl font-mono font-black text-accent-blue mt-1">{sitrepData.totalScanned}</div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-900 p-3 text-center">
              <div className="text-xs text-slate-500 font-semibold">Hotlist Detections</div>
              <div className="text-2xl font-mono font-black text-red-500 mt-1">{sitrepData.watchlistHits}</div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-900 p-3 text-center">
              <div className="text-xs text-slate-500 font-semibold">Successful Intercepts</div>
              <div className="text-2xl font-mono font-black text-emerald-500 mt-1">{sitrepData.interceptionsConfirmed}</div>
            </div>
            <div className="rounded-lg border border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-900 p-3 text-center">
              <div className="text-xs text-slate-500 font-semibold">Avg PCR Response</div>
              <div className="text-2xl font-mono font-black text-amber-500 mt-1">{sitrepData.avgPcrResponseTime}</div>
            </div>
          </div>

          {/* Top Hotspots */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Top Incident Hotspots & Grid Activity
            </h3>
            <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-navy-800">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-100 dark:bg-navy-900 text-slate-600 dark:text-slate-400 uppercase">
                  <tr>
                    <th className="p-2.5">Junction / Surveillance Node</th>
                    <th className="p-2.5">Watchlist Hits</th>
                    <th className="p-2.5">Severity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-navy-800 bg-white dark:bg-navy-950">
                  {sitrepData.topHotspots.map((h, i) => (
                    <tr key={i}>
                      <td className="p-2.5 font-sans font-medium text-slate-900 dark:text-slate-100">{h.junction}</td>
                      <td className="p-2.5 font-bold text-accent-blue">{h.hits} Detections</td>
                      <td className="p-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          h.severity === 'HIGH' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                        }`}>
                          {h.severity}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Officer Certification Footer */}
          <div className="pt-4 border-t border-slate-300 dark:border-navy-800 flex items-center justify-between text-xs text-slate-500">
            <div>CONFIDENTIAL REPORT • GUJARAT POLICE SURVEILLANCE GRID</div>
            <div className="font-mono">VERIFIED BY DUTY COMMANDER</div>
          </div>
        </div>
      </div>
    </div>
  );
};
