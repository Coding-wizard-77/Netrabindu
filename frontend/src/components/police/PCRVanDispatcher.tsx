import React, { useState } from 'react';
import { Radio, MapPin, Send, CheckCircle2, Shield, PhoneCall } from 'lucide-react';
import { tacticalAudio } from '../../utils/audio';

interface PCRVanDispatcherProps {
  targetPlate?: string;
  targetLocation?: string;
  onDispatchSuccess?: (vanCallsign: string) => void;
}

export const PCRVanDispatcher: React.FC<PCRVanDispatcherProps> = ({
  targetPlate = 'GJ01AB1234',
  targetLocation = 'SG Highway near Chanakyapuri Chokdi',
  onDispatchSuccess,
}) => {
  const [selectedVan, setSelectedVan] = useState<string>('CHETAK-04');
  const [isDispatched, setIsDispatched] = useState<boolean>(false);

  const vans = [
    { callsign: 'CHETAK-04', officer: 'ASI R. B. Solanki', dist: '1.2 km', eta: '2 mins', status: 'PATROLLING_NEARBY' },
    { callsign: 'EAGLE-12', officer: 'Head Const. K. M. Vaghela', dist: '3.4 km', eta: '5 mins', status: 'STATIONARY' },
    { callsign: 'VAJRA-07', officer: 'PSI D. N. Parmar', dist: '5.1 km', eta: '8 mins', status: 'INTERCEPT_READY' },
  ];

  const handleDispatch = () => {
    tacticalAudio.playRadioChirp();
    setIsDispatched(true);
    if (onDispatchSuccess) {
      onDispatchSuccess(selectedVan);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-navy-700 bg-white dark:bg-navy-900/90 p-4 space-y-3">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-2">
        <div className="flex items-center space-x-2">
          <div className="rounded bg-accent-blue/20 p-1.5 text-accent-blue">
            <Radio className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              112 PCR Patrol Unit Rapid Dispatch
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Dispatch nearest patrol intercept unit</p>
          </div>
        </div>
        <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/40">
          GPS TELEMETRY ACTIVE
        </span>
      </div>

      {/* Target Info */}
      <div className="rounded bg-slate-50 dark:bg-navy-950 p-2.5 text-xs font-mono border border-slate-200 dark:border-navy-800/80">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400">TARGET:</span>
          <span className="font-bold text-amber-500 dark:text-amber-400">{targetPlate}</span>
        </div>
        <div className="flex items-center justify-between mt-1 text-[11px]">
          <span className="text-slate-500 dark:text-slate-400">LOCATION:</span>
          <span className="text-slate-800 dark:text-slate-200">{targetLocation}</span>
        </div>
      </div>

      {/* Available Units Selection */}
      <div className="space-y-1.5">
        <label className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-bold uppercase">Select Intercept Patrol Unit</label>
        {vans.map((v) => (
          <div
            key={v.callsign}
            onClick={() => setSelectedVan(v.callsign)}
            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer border transition-colors ${
              selectedVan === v.callsign
                ? 'border-accent-blue bg-accent-blue/15 text-slate-900 dark:text-white'
                : 'border-slate-200 dark:border-navy-800 bg-slate-50 dark:bg-navy-950/60 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Radio className="h-3.5 w-3.5 text-cyan-500 dark:text-accent-cyan" />
              <div>
                <div className="font-mono text-xs font-bold">{v.callsign}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">{v.officer}</div>
              </div>
            </div>
            <div className="text-right font-mono text-[11px]">
              <div className="text-amber-500 dark:text-amber-400 font-bold">ETA: {v.eta}</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">{v.dist}</div>
            </div>
          </div>
        ))}
      </div>

      {isDispatched ? (
        <div className="rounded bg-emerald-950/80 border border-emerald-500/50 p-2 text-xs text-emerald-300 flex items-center space-x-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0 animate-pulse" />
          <span>Intercept orders radioed to {selectedVan}. Vector coordinates transmitted.</span>
        </div>
      ) : (
        <button
          onClick={handleDispatch}
          className="w-full flex items-center justify-center space-x-2 rounded-lg bg-accent-blue py-2 text-xs font-bold text-white hover:bg-accent-blue/90 shadow transition-colors active:scale-95"
        >
          <Send className="h-3.5 w-3.5" />
          <span>DISPATCH {selectedVan} NOW</span>
        </button>
      )}
    </div>
  );
};
