import React from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { formatToIST } from '../../utils/date';
import { Printer, Shield, FileText } from 'lucide-react';

interface DailyPoliceSitRepModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DailyPoliceSitRepModal: React.FC<DailyPoliceSitRepModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Daily Police Situation Report (SitRep)"
      subtitle="Executive shift briefing for Senior Police Leadership (DGP / CP / SP)"
      size="xl"
    >
      <div className="space-y-4">
        <div className="p-6 bg-white text-slate-900 rounded-xl border border-slate-300 font-serif leading-relaxed text-xs print:m-0 print:p-0 print:border-none space-y-4">
          <div className="text-center border-b-2 border-slate-900 pb-3">
            <div className="text-[10px] font-bold uppercase tracking-widest text-slate-700">
              GUJARAT STATE POLICE HEADQUARTERS • COMMAND &amp; CONTROL
            </div>
            <h2 className="text-base font-bold font-sans uppercase tracking-tight text-slate-950 mt-1">
              DAILY 24-HOUR SURVEILLANCE SITUATION REPORT (SITREP)
            </h2>
            <div className="text-[11px] font-sans text-slate-600">
              Period: 04-Sep-2026 08:00 hrs to 05-Sep-2026 08:00 hrs • Shift Officer: DySP A. K. Varma
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 p-3 bg-slate-100 rounded border border-slate-300 font-sans text-xs">
            <div>
              <span className="text-slate-500 block text-[10px]">TOTAL VEHICLES SCANNED</span>
              <strong className="text-slate-950 text-sm">1,248,910</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">HOTLIST WATCHLIST HITS</span>
              <strong className="text-rose-600 text-sm">42 Confirmed</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">NAKABANDI ACTIVATIONS</span>
              <strong className="text-blue-900 text-sm">6 Operations</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">STOLEN VEHICLES RECOVERED</span>
              <strong className="text-emerald-700 text-sm">9 Intercepted</strong>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="font-sans font-bold uppercase text-slate-950 text-xs border-b border-slate-300 pb-1">
              1. High-Priority Watchlist &amp; Crime Interceptions
            </h4>
            <p>
              Target vehicle <strong>GJ 01 AB 1234</strong> (White Creta), wanted in connection with FIR CR-142/26 (Navrangpura PS), was detected at S.G. Highway Junction 04 at 14:32 hrs. Nakabandi was initiated within 15 km perimeter. PCR Unit AHM-PCR-14 intercepted the vehicle near Sanand Crossroad at 14:48 hrs. Suspect taken into custody.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-sans font-bold uppercase text-slate-950 text-xs border-b border-slate-300 pb-1">
              2. 26 Departments Surveillance Grid Health
            </h4>
            <p>
              98.4% of municipal, traffic, and CID cameras operated at optimal availability. Sentinel Adaptive Edge Intelligence reduced WAN bandwidth consumption by 64.2%, preserving high-definition evidence buffers for all 42 correlated incident alerts.
            </p>
          </div>

          <div className="pt-6 grid grid-cols-2 gap-8 text-center text-xs font-sans">
            <div>
              <div className="border-b border-slate-400 w-40 mx-auto mb-1"></div>
              <div className="font-bold">Duty Officer (Command Center)</div>
            </div>
            <div>
              <div className="border-b border-slate-400 w-40 mx-auto mb-1"></div>
              <div className="font-bold">Commissioner of Police, Ahmedabad</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800 no-print">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button variant="tactical" icon={<Printer className="w-4 h-4" />} onClick={() => window.print()}>
            Print Official SitRep
          </Button>
        </div>
      </div>
    </Modal>
  );
};
