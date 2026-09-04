import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { ShieldAlert, Radio, CheckCircle, MapPin, AlertTriangle } from 'lucide-react';

interface NakabandiLockdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetPlate: string;
}

export const NakabandiLockdownModal: React.FC<NakabandiLockdownModalProps> = ({
  isOpen,
  onClose,
  targetPlate,
}) => {
  const [radiusKm, setRadiusKm] = useState('15');
  const [reason, setReason] = useState('Suspect Vehicle Fleeing Serious Crime Scene (FIR CR-142/26)');
  const [notifiedCheckpoints, setNotifiedCheckpoints] = useState<string[]>([]);
  const [isActivated, setIsActivated] = useState(false);

  const checkpointsList = [
    'S.G. Highway Toll Plaza Checkpost',
    'Sanand Crossroad Police Checkpost',
    'Iscon-Bopal Ring Road Perimeter',
    'SP Ring Road Odhav Exit Toll',
    'Gandhinagar Koba Circle Barrier',
    'Narol Circle Highway Checkpoint',
  ];

  const handleActivate = () => {
    setNotifiedCheckpoints(checkpointsList);
    setIsActivated(true);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Regional Roadblock & Checkpost Alert (નાકાબંધી / NAKABANDI)"
      subtitle="Broadcast emergency intercept perimeter across Gujarat Police checkposts & toll plazas"
      size="lg"
    >
      <div className="space-y-4 font-mono text-xs">
        {isActivated ? (
          <div className="p-6 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl text-emerald-300 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white uppercase">
                  NAKABANDI PERIMETER ACTIVE ({radiusKm} KM RADIUS)
                </h3>
                <p className="text-xs text-emerald-200 mt-0.5">
                  Emergency intercept alert transmitted to 6 Toll Plazas &amp; 14 PCR Field Interceptors.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-[11px]">
              <div className="text-slate-400 font-bold uppercase">Activated Checkpoints:</div>
              <div className="grid grid-cols-2 gap-2 text-white">
                {notifiedCheckpoints.map((cp) => (
                  <div key={cp} className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>{cp}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="tactical" onClick={onClose}>
                Return to Command Center
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-rose-950/20 border border-rose-500/40 rounded-xl text-rose-200 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block uppercase">High-Priority Police Intercept Broadcast</strong>
                <span>
                  This action will alert all automatic number plate recognition (ANPR) cameras at toll gates and dispatch alerts to active PCR vans for suspect vehicle: <strong className="text-white underline">{targetPlate}</strong>.
                </span>
              </div>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Perimeter Lockdown Radius</label>
              <select
                value={radiusKm}
                onChange={(e) => setRadiusKm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
              >
                <option value="10">10 km Radius (Immediate City Core)</option>
                <option value="15">15 km Radius (Outer Ring Road & City Tolls)</option>
                <option value="25">25 km Radius (District Highway Exits)</option>
                <option value="50">50 km Radius (State Interstate Corridors)</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Incident / Dispatch Rationale</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-white"
              />
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5">
              <div className="text-[10px] text-slate-400 uppercase font-bold">Targeted Checkposts (Preview):</div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-300">
                {checkpointsList.slice(0, 4).map((cp) => (
                  <div key={cp} className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 text-cyan-400" />
                    <span>{cp}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="danger"
                icon={<Radio className="w-4 h-4" />}
                onClick={handleActivate}
              >
                Trigger State Nakabandi
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
