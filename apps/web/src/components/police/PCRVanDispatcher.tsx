import React, { useState } from 'react';
import { Shield, Radio, MapPin, Send, PhoneCall, CheckCircle } from 'lucide-react';
import { Button } from '../common/Button';

interface PCRUnit {
  callsign: string;
  vehicleNo: string;
  officerInCharge: string;
  phone: string;
  zone: string;
  distanceKm: number;
  etaMins: number;
  status: 'AVAILABLE' | 'DISPATCHED' | 'BUSY';
}

const pcrFleet: PCRUnit[] = [
  { callsign: 'AHM-PCR-14', vehicleNo: 'GJ 01 G 1014', officerInCharge: 'PSI M. S. Rana', phone: '+91 98250 11214', zone: 'S.G. Highway Sector', distanceKm: 1.8, etaMins: 3, status: 'AVAILABLE' },
  { callsign: 'AHM-PCR-08', vehicleNo: 'GJ 01 G 1008', officerInCharge: 'ASI B. D. Vaghela', phone: '+91 98250 11208', zone: 'Iscon Crossroad', distanceKm: 3.2, etaMins: 6, status: 'AVAILABLE' },
  { callsign: 'TRAFFIC-INTERCEPT-02', vehicleNo: 'GJ 01 G 2202', officerInCharge: 'PI K. L. Zala', phone: '+91 98250 11222', zone: 'Sanand Ring Road', distanceKm: 5.4, etaMins: 9, status: 'AVAILABLE' },
  { callsign: 'CRIME-QRT-01', vehicleNo: 'GJ 01 G 9001', officerInCharge: 'Inspector A. P. Solanki', phone: '+91 98250 11299', zone: 'CID Crime HQ', distanceKm: 7.1, etaMins: 12, status: 'AVAILABLE' },
];

interface PCRVanDispatcherProps {
  onDispatchSuccess?: (unit: PCRUnit) => void;
}

export const PCRVanDispatcher: React.FC<PCRVanDispatcherProps> = ({ onDispatchSuccess }) => {
  const [selectedUnit, setSelectedUnit] = useState<PCRUnit | null>(null);
  const [dispatchedUnits, setDispatchedUnits] = useState<string[]>([]);

  const handleDispatch = (unit: PCRUnit) => {
    setDispatchedUnits([...dispatchedUnits, unit.callsign]);
    if (onDispatchSuccess) onDispatchSuccess(unit);
  };

  return (
    <div className="glass-panel p-4 rounded-2xl space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-500">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              PCR Field Response Fleet (112 / 100 Network)
            </h4>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Nearest Interceptors &amp; Quick Response Teams</span>
          </div>
        </div>
        <span className="text-[10px] font-bold text-emerald-500 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
          4 Active In Sector
        </span>
      </div>

      <div className="space-y-2">
        {pcrFleet.map((unit) => {
          const isDispatched = dispatchedUnits.includes(unit.callsign);

          return (
            <div
              key={unit.callsign}
              className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                isDispatched
                  ? 'bg-blue-950/20 border-blue-500/40 text-blue-200'
                  : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 hover:border-cyan-500/40'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                  <span>{unit.callsign}</span>
                  <span className="text-[10px] text-slate-500 font-normal">({unit.vehicleNo})</span>
                  {isDispatched && (
                    <span className="text-[9px] px-1.5 py-0.2 bg-blue-600 text-white rounded font-bold">
                      EN ROUTE
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Officer: <strong>{unit.officerInCharge}</strong> • {unit.zone}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  Direct PCR Comms: {unit.phone}
                </div>
              </div>

              <div className="flex items-center gap-3 text-right">
                <div>
                  <div className="text-emerald-600 dark:text-emerald-400 font-bold">{unit.distanceKm} km away</div>
                  <div className="text-[10px] text-slate-400 font-bold">ETA: ~{unit.etaMins} mins</div>
                </div>

                <Button
                  size="sm"
                  variant={isDispatched ? 'secondary' : 'tactical'}
                  disabled={isDispatched}
                  icon={isDispatched ? <CheckCircle className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                  onClick={() => handleDispatch(unit)}
                >
                  {isDispatched ? 'Dispatched' : 'Dispatch'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
