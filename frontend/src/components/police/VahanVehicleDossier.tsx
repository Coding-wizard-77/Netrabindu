import React from 'react';
import { 
  X, 
  Car, 
  User, 
  FileText, 
  MapPin
} from 'lucide-react';
import { tacticalAudio } from '../../utils/audio';

export interface VahanVehicleDossierProps {
  plateNumber?: string;
  plate?: string;
  isOpen?: boolean;
  onClose?: () => void;
  isStolen?: boolean;
  onAddToWatchlist?: (plate: string) => void;
}

export const VahanVehicleDossier: React.FC<VahanVehicleDossierProps> = ({
  plateNumber,
  plate,
  isOpen = true,
  onClose,
  isStolen,
  onAddToWatchlist,
}) => {
  const activePlate = plateNumber || plate || 'GJ01AB1234';

  if (!isOpen) return null;

  const vehicleData = {
    plate: activePlate,
    registrationDate: '14-Mar-2021',
    ownerName: 'Rajeshbhai M. Patel',
    fatherName: 'Manilal Patel',
    address: 'B-402, Shivalik Heights, Judges Bungalow Road, Bodakdev, Ahmedabad - 380054',
    rtoAuthority: 'GJ-01 (Ahmedabad RTO, Subhash Bridge)',
    vehicleClass: 'Motor Car (LMV - Private)',
    makerModel: 'HYUNDAI CRETA SX 1.5 DIESEL',
    engineNumber: 'D4FA-M892147',
    chassisNumber: 'MALC141CM9M210984',
    fuelType: 'DIESEL (BS-VI)',
    color: 'POLAR WHITE',
    insuranceExpiry: '12-Mar-2027 (HDFC ERGO General Insurance - Active)',
    pucValidity: '19-Nov-2026 (Valid)',
    hypothecationBank: 'State Bank of India (Auto Loan Branch, Ashram Road)',
    stolenStatus: isStolen ? 'STOLEN - FIR #CR-9042/2026 REGISTERED' : 'NO STOLEN RECORD FOUND',
    challanCount: 3,
    challanTotal: '₹ 2,500 (2 Unpaid)',
    fastagTransits: [
      { plaza: 'SP Ring Road Ognaj Toll', time: '04-Sep-2026 09:14 AM', lane: 'Lane 04 (FASTag RFID)' },
      { plaza: 'Vadodara-Ahmedabad Expressway Toll', time: '02-Sep-2026 18:42 PM', lane: 'Lane 02 (FASTag RFID)' },
      { plaza: 'Chorwad NH-8D Toll Plaza', time: '28-Aug-2026 14:10 PM', lane: 'Lane 01 (FASTag RFID)' },
    ],
  };

  const isModal = Boolean(onClose);

  const content = (
    <div className="space-y-4">
      {/* Plate & Header Hero */}
      <div className="flex flex-wrap items-center justify-between rounded-xl border border-navy-700 bg-navy-900/80 p-4">
        <div>
          <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Registration Mark</span>
          <div className="text-2xl font-mono font-black text-amber-400 tracking-wider">
            {vehicleData.plate}
          </div>
          <div className="text-xs font-semibold text-slate-300">{vehicleData.makerModel}</div>
        </div>
        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          {isStolen && (
            <span className="rounded bg-red-600/20 px-2.5 py-1 text-xs font-mono font-bold text-red-400 border border-red-500/40">
              STOLEN / WANTED
            </span>
          )}
          {onAddToWatchlist && (
            <button
              onClick={() => {
                tacticalAudio.playKeyClick();
                onAddToWatchlist(vehicleData.plate);
              }}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-500 transition-colors shadow"
            >
              + Add to Hotlist
            </button>
          )}
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Owner Details */}
        <div className="rounded-lg border border-navy-800 bg-navy-900/50 p-3 space-y-2">
          <h3 className="font-bold text-slate-300 flex items-center gap-1.5 border-b border-navy-800 pb-1">
            <User className="h-3.5 w-3.5 text-accent-cyan" /> Ownership Particulars
          </h3>
          <div className="space-y-1 font-mono">
            <div><span className="text-slate-500">OWNER NAME:</span> <span className="font-bold text-slate-200">{vehicleData.ownerName}</span></div>
            <div><span className="text-slate-500">FATHER NAME:</span> <span className="text-slate-300">{vehicleData.fatherName}</span></div>
            <div><span className="text-slate-500">RTO AUTHORITY:</span> <span className="text-slate-300">{vehicleData.rtoAuthority}</span></div>
            <div><span className="text-slate-500">REG. DATE:</span> <span className="text-slate-300">{vehicleData.registrationDate}</span></div>
            <div className="text-[11px] text-slate-400 pt-1 leading-snug"><span className="text-slate-500">ADDRESS:</span> {vehicleData.address}</div>
          </div>
        </div>

        {/* Technical & Compliance */}
        <div className="rounded-lg border border-navy-800 bg-navy-900/50 p-3 space-y-2">
          <h3 className="font-bold text-slate-300 flex items-center gap-1.5 border-b border-navy-800 pb-1">
            <FileText className="h-3.5 w-3.5 text-accent-cyan" /> Technical & Compliance
          </h3>
          <div className="space-y-1 font-mono">
            <div><span className="text-slate-500">ENGINE NO:</span> <span className="text-slate-300">{vehicleData.engineNumber}</span></div>
            <div><span className="text-slate-500">CHASSIS NO:</span> <span className="text-slate-300">{vehicleData.chassisNumber}</span></div>
            <div><span className="text-slate-500">INSURANCE:</span> <span className="text-emerald-400 font-bold">{vehicleData.insuranceExpiry}</span></div>
            <div><span className="text-slate-500">PUC VALIDITY:</span> <span className="text-emerald-400">{vehicleData.pucValidity}</span></div>
            <div><span className="text-slate-500">HYPOTHECATION:</span> <span className="text-slate-300">{vehicleData.hypothecationBank}</span></div>
          </div>
        </div>
      </div>

      {/* FASTag Electronic Toll History */}
      <div className="rounded-lg border border-navy-800 bg-navy-900/50 p-3 space-y-2">
        <h3 className="font-bold text-slate-300 flex items-center justify-between border-b border-navy-800 pb-1">
          <div className="flex items-center gap-1.5 text-xs">
            <MapPin className="h-3.5 w-3.5 text-amber-400" /> FASTag Electronic Toll Plazas Transit History
          </div>
          <span className="text-[10px] font-mono text-slate-400">NETC / NPCI GATEWAY</span>
        </h3>
        <div className="space-y-1.5">
          {vehicleData.fastagTransits.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between rounded bg-navy-950 p-2 text-xs font-mono border border-navy-800/60">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-accent-cyan"></span>
                <span className="font-bold text-slate-200">{item.plaza}</span>
              </div>
              <div className="flex items-center space-x-3 text-[11px] text-slate-400">
                <span>{item.time}</span>
                <span className="text-accent-cyan">{item.lane}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  if (!isModal) {
    return (
      <div className="rounded-2xl border border-navy-700 bg-navy-950/60 p-4 shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Car className="h-5 w-5 text-accent-blue" />
          <h3 className="font-mono text-sm font-bold text-white uppercase tracking-wider">
            VAHAN 4.0 / Sarathi Vehicle Intelligence Dossier
          </h3>
        </div>
        {content}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
      <div className="relative w-full max-w-3xl rounded-xl border border-navy-700 bg-navy-950 p-6 shadow-2xl text-slate-100 my-8">
        <div className="flex items-center justify-between border-b border-navy-800 pb-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-accent-blue/20 p-2 text-accent-blue border border-accent-blue/30">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold uppercase tracking-wider text-slate-100">
                  VAHAN 4.0 / Sarathi Vehicle Dossier
                </h2>
                <span className="rounded bg-accent-blue/20 px-2 py-0.5 text-xs font-mono font-bold text-accent-cyan border border-accent-blue/30">
                  NATIONAL REGISTRY SYNC
                </span>
              </div>
              <p className="text-xs text-slate-400">
                MoRTH National Register verified vehicle registration & FASTag electronic toll records
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

        <div className="max-h-[75vh] overflow-y-auto pr-2">
          {content}
        </div>

        <div className="mt-6 flex justify-end border-t border-navy-800 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-navy-800 px-4 py-2 text-xs font-semibold text-slate-200 hover:bg-navy-700"
          >
            Close Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
