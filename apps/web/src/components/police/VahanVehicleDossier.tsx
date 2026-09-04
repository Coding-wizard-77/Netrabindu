import React from 'react';
import { Car, UserCheck, ShieldAlert, Calendar, ShieldCheck, MapPin } from 'lucide-react';
import { formatLicensePlateDisplay } from '../../utils/normalizer';

interface VahanVehicleDossierProps {
  plate: string;
  isStolen?: boolean;
}

export const VahanVehicleDossier: React.FC<VahanVehicleDossierProps> = ({
  plate,
  isStolen = true,
}) => {
  return (
    <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
            <Car className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider">
              VAHAN 4.0 National Registry Record
            </h4>
            <span className="text-[10px] text-slate-400">Integrated RTO &amp; Police Hotlist Database</span>
          </div>
        </div>

        {isStolen ? (
          <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-bold text-[10px] animate-pulse">
            STOLEN VEHICLE ALERT
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">
            CLEAR RECORD
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-slate-500 block text-[9px]">REGISTERED OWNER</span>
          <strong className="text-white">Ramesh Chandra Patel</strong>
        </div>

        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-slate-500 block text-[9px]">VEHICLE MAKE / MODEL</span>
          <strong className="text-cyan-300">Hyundai Creta SX (White)</strong>
        </div>

        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-slate-500 block text-[9px]">RTO REGISTERING AUTH</span>
          <strong className="text-white">GJ-01 (Ahmedabad RTO)</strong>
        </div>

        <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-slate-500 block text-[9px]">CHASSIS / ENGINE NO.</span>
          <strong className="text-slate-400 truncate block">MALC381... / G4FLM...</strong>
        </div>
      </div>

      {isStolen && (
        <div className="p-3 bg-rose-950/20 border border-rose-500/30 rounded-xl text-rose-300 space-y-1">
          <div className="font-bold text-rose-400 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            Crime Reference: FIR No. I-142/2026 (Sec 379 IPC)
          </div>
          <div className="text-[11px] text-rose-200">
            Reported stolen from Vastrapur Lake parking, Ahmedabad on 02-Sep-2026. Complainant: R. C. Patel.
          </div>
        </div>
      )}
    </div>
  );
};
