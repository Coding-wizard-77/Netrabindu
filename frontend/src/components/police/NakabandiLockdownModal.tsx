import React, { useState } from 'react';
import { X, Lock, Radio, MapPin, CheckCircle2 } from 'lucide-react';
import { tacticalAudio } from '../../utils/audio';

export interface NakabandiLockdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlate?: string;
  initialPlate?: string;
  plate?: string;
}

export const NakabandiLockdownModal: React.FC<NakabandiLockdownModalProps> = ({
  isOpen,
  onClose,
  targetPlate,
  initialPlate,
  plate,
}) => {
  const defaultPlate = targetPlate || initialPlate || plate || 'GJ01AB1234';
  const [radiusKm, setRadiusKm] = useState<number>(15);
  const [activePlate, setActivePlate] = useState<string>(defaultPlate);
  const [incidentType, setIncidentType] = useState<string>('ARMED_ROBBERY_FLEEING');
  const [isBroadcasted, setIsBroadcasted] = useState<boolean>(false);

  if (!isOpen) return null;

  const checkposts = [
    { name: 'SP Ring Road Bopal Toll Plaza', dist: '4.2 km', eta: '6 mins', contact: '+91 79 2754 0100', status: 'ACTIVE' },
    { name: 'SG Highway Chanakyapuri Chokdi', dist: '7.8 km', eta: '11 mins', contact: '+91 79 2754 0102', status: 'ACTIVE' },
    { name: 'Geeta Mandir Central Checkpost', dist: '12.4 km', eta: '18 mins', contact: '+91 79 2754 0105', status: 'READY' },
    { name: 'Kalupur Railway Station Crossroad', dist: '14.1 km', eta: '21 mins', contact: '+91 79 2754 0108', status: 'READY' },
    { name: 'Narol Industrial Toll Barrier', dist: '18.6 km', eta: '26 mins', contact: '+91 79 2754 0110', status: 'ALERTED' },
  ].filter((cp) => parseFloat(cp.dist) <= radiusKm + 5);

  const handleTriggerLockdown = () => {
    tacticalAudio.playLockdownKlaxon();
    setIsBroadcasted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl rounded-xl border border-red-700/60 bg-navy-950 p-6 shadow-2xl text-slate-100">
        <div className="flex items-center justify-between border-b border-navy-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-red-500/20 p-2 text-red-400 border border-red-500/40 animate-pulse">
              <Lock className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold uppercase tracking-wider text-slate-100 flex items-center gap-2">
                Nakabandi Checkpost Grid Lockdown
                <span className="text-xs px-2 py-0.5 rounded bg-red-600 text-white font-mono">EMERGENCY PROTOCOL</span>
              </h2>
              <p className="text-xs text-slate-400">
                Seal perimeter checkposts & dispatch automated intercept vector alerts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-navy-800 hover:text-slate-100 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Target License Plate</label>
              <input
                type="text"
                value={activePlate}
                onChange={(e) => setActivePlate(e.target.value.toUpperCase())}
                className="mt-1 w-full rounded-lg border border-red-700 bg-red-950/40 px-3 py-1.5 font-mono text-sm font-bold text-red-300 focus:outline-none uppercase"
              />
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase text-slate-400 font-bold">Emergency Category</label>
              <select
                value={incidentType}
                onChange={(e) => setIncidentType(e.target.value)}
                className="mt-1 w-full rounded-lg border border-navy-700 bg-navy-900 px-3 py-1.5 text-xs text-slate-200 focus:outline-none font-medium"
              >
                <option value="ARMED_ROBBERY_FLEEING">Armed Robbery / Fleeing Suspect</option>
                <option value="HIT_AND_RUN_FATAL">Fatal Hit & Run</option>
                <option value="RED_NOTICE_TERROR">Red Notice / National Security</option>
                <option value="KIDNAPPING_AMBER_ALERT">Abduction / Kidnapping</option>
              </select>
            </div>
          </div>

          <div className="rounded-lg border border-navy-800 bg-navy-900/60 p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Lockdown Perimeter Radius:</span>
              <span className="font-mono font-bold text-accent-cyan text-sm">{radiusKm} KM RADIUS</span>
            </div>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={radiusKm}
              onChange={(e) => setRadiusKm(parseInt(e.target.value))}
              className="w-full h-1.5 bg-navy-700 rounded-lg appearance-none cursor-pointer accent-red-500"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-500">
              <span>5 km (City Center)</span>
              <span>25 km (Ring Road Grid)</span>
              <span>50 km (State Highway Perimeter)</span>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Engaged Checkposts & Toll Gates ({checkposts.length})
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">ALL CHANNELS LIVE</span>
            </div>
            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {checkposts.map((cp, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg bg-navy-900 p-2 border border-navy-800 text-xs"
                >
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-3.5 w-3.5 text-red-400" />
                    <span className="font-medium text-slate-200">{cp.name}</span>
                  </div>
                  <div className="flex items-center space-x-3 font-mono text-[11px]">
                    <span className="text-slate-400">{cp.dist}</span>
                    <span className="text-amber-400 font-bold">ETA ~{cp.eta}</span>
                    <span className="rounded bg-emerald-950 px-1.5 py-0.2 text-[9px] text-emerald-400 font-bold border border-emerald-800">
                      {cp.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {isBroadcasted && (
            <div className="rounded-lg bg-red-950/60 border border-red-500/50 p-3 flex items-center space-x-3 text-red-300 text-xs animate-in zoom-in-95 duration-150">
              <CheckCircle2 className="h-5 w-5 text-red-400 flex-shrink-0 animate-bounce" />
              <div>
                <div className="font-bold">NAKABANDI PERIMETER SEAL INITIATED</div>
                <div className="text-[11px] text-red-300/80">
                  SMS alerts & 112 PCR dispatch orders transmitted to {checkposts.length} checkposts. Spikes & barriers deployed.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-navy-800 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-navy-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-navy-700"
          >
            Cancel
          </button>
          <button
            onClick={handleTriggerLockdown}
            className="flex items-center space-x-2 rounded-lg bg-red-600 px-5 py-2 text-xs font-bold text-white hover:bg-red-500 shadow-lg shadow-red-600/30 transition-all active:scale-95"
          >
            <Radio className="h-4 w-4 animate-pulse" />
            <span>EXECUTE NAKABANDI LOCKDOWN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
