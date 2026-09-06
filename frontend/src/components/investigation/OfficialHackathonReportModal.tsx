import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  MapPin, 
  Car, 
  ExternalLink 
} from 'lucide-react';
import { sentinelApi, HackathonOutputReport } from '../../api/sentinel';
import { tacticalAudio } from '../../utils/audio';

interface OfficialHackathonReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plate: string;
}

export const OfficialHackathonReportModal: React.FC<OfficialHackathonReportModalProps> = ({
  isOpen,
  onClose,
  plate,
}) => {
  const [report, setReport] = useState<HackathonOutputReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && plate) {
      tacticalAudio.playRadioChirp();
      setLoading(true);
      sentinelApi
        .getOutputReport(plate)
        .then((res) => setReport(res))
        .catch((err) => console.error('Report fetch failed:', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, plate]);

  if (!isOpen) return null;

  const handlePrint = () => {
    tacticalAudio.playKeyClick();
    window.open(`/api/vehicles/${encodeURIComponent(plate)}/report/html`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-4xl rounded-2xl glass-panel border border-cyan-500/40 shadow-glass-elevated flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-navy-700 bg-navy-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2 py-0.5 rounded bg-cyan-600/20 text-cyan-300 font-bold text-[10px] border border-cyan-500/40 uppercase">
                GUJARAT POLICE EVALUATION SUBMISSION DELIVERABLE
              </span>
              <h2 className="text-lg font-black tracking-tight text-white mt-0.5">
                Official Hackathon Vehicle Trajectory Output Report
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-glow-cyan flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Open Dossier
            </button>
            <button
              onClick={() => {
                tacticalAudio.playKeyClick();
                onClose();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-5 text-xs">
          {loading && (
            <div className="p-12 text-center text-slate-400 animate-pulse">
              Compiling court-admissible surveillance dossier...
            </div>
          )}

          {!loading && report && (
            <>
              {/* Top Meta Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-navy-950 rounded-xl border border-navy-800">
                  <span className="text-[10px] text-slate-500 block">DESIGNATED TARGET</span>
                  <span className="text-base font-bold text-amber-400 font-mono">
                    {report.designated_vehicle_plate}
                  </span>
                </div>
                <div className="p-3 bg-navy-950 rounded-xl border border-navy-800">
                  <span className="text-[10px] text-slate-500 block">TOTAL SIGHTINGS</span>
                  <span className="text-base font-bold text-cyan-400 font-mono">
                    {report.total_sightings} Observations
                  </span>
                </div>
                <div className="p-3 bg-navy-950 rounded-xl border border-navy-800">
                  <span className="text-[10px] text-slate-500 block">CORRIDOR DISTANCE</span>
                  <span className="text-base font-bold text-emerald-400 font-mono">
                    {report.total_distance_km} km
                  </span>
                </div>
                <div className="p-3 bg-navy-950 rounded-xl border border-navy-800">
                  <span className="text-[10px] text-slate-500 block">AVG SPEED</span>
                  <span className="text-base font-bold text-white font-mono">
                    {report.average_speed_kmh} km/h
                  </span>
                </div>
              </div>

              {/* VAHAN 4.0 / Stolen Vehicle Dossier Box */}
              <div className="p-4 rounded-xl bg-navy-950 border border-navy-750 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                    <Car className="w-4 h-4" />
                    VAHAN 4.0 &amp; eGujCop Crime Record Bureau Match
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 font-bold text-[10px] border border-rose-500/40">
                    ACTIVE FIR MATCHED
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-slate-300">
                  <div>
                    <span className="text-slate-500">Vehicle:</span> {report.vehicle_details.vehicle_class}
                  </div>
                  <div>
                    <span className="text-slate-500">Owner:</span> {report.vehicle_details.owner_name}
                  </div>
                  <div>
                    <span className="text-slate-500">RTO:</span> {report.vehicle_details.rto_jurisdiction}
                  </div>
                </div>
                <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-[11px]">
                  <strong>Case Record:</strong> {report.vehicle_details.active_fir_number} ({report.vehicle_details.police_station}) &bull; Sections: {report.vehicle_details.fir_sections}
                </div>
              </div>

              {/* Timestamped Movement History Table */}
              <div className="space-y-2">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  Chronological Multi-Camera Movement History
                </h3>
                <div className="rounded-xl overflow-hidden border border-navy-800">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead className="bg-navy-950 text-slate-400 font-mono uppercase border-b border-navy-800">
                      <tr>
                        <th className="p-2.5">#</th>
                        <th className="p-2.5">Time (IST)</th>
                        <th className="p-2.5">Camera Code</th>
                        <th className="p-2.5">Location Checkpoint</th>
                        <th className="p-2.5">Department</th>
                        <th className="p-2.5">Speed</th>
                        <th className="p-2.5">PTS Timing</th>
                        <th className="p-2.5">OCR Conf</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-navy-850 bg-navy-900/40">
                      {report.timeline.map((pt) => (
                        <tr key={pt.sequence} className="hover:bg-navy-800/50">
                          <td className="p-2.5 font-bold text-slate-400">{pt.sequence}</td>
                          <td className="p-2.5 font-mono text-slate-200">
                            {new Date(pt.occurred_at).toLocaleTimeString('en-IN', { hour12: false })}
                          </td>
                          <td className="p-2.5 font-bold text-cyan-400 font-mono">{pt.camera_code}</td>
                          <td className="p-2.5 text-slate-300">{pt.camera_name}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded bg-navy-950 text-[10px] text-slate-300 border border-navy-800">
                              {pt.department_name.split(' ')[0]}
                            </span>
                          </td>
                          <td className="p-2.5 text-emerald-400 font-bold">{pt.speed_estimate_kmh} km/h</td>
                          <td className="p-2.5 font-mono text-cyan-300">{pt.pts_timestamp_ms.toFixed(0)} ms</td>
                          <td className="p-2.5 font-bold text-amber-400">{pt.confidence}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Corridor Gaps Callout */}
              {report.corridor_gaps.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-bold text-indigo-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-indigo-400" />
                    Unobserved Corridor Transit Gaps
                  </h4>
                  {report.corridor_gaps.map((gap, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/40 text-[11px] text-indigo-200 space-y-1"
                    >
                      <div className="font-bold text-indigo-300">
                        Transit Gap {i + 1}: Between {gap.from_camera} and {gap.to_camera}
                      </div>
                      <div className="text-slate-300">
                        Duration: <b>{gap.gap_duration_minutes} mins unobserved</b> &bull; Estimated Gap Distance: <b>{gap.distance_km} km</b>
                      </div>
                      <div className="text-[10px] text-indigo-400">
                        Reason: {gap.reason} (Implicit route interpolation prevented per digital evidence standards)
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Forensic Section 65B Cryptographic Digest Seal */}
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/50 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>Section 65B Indian Evidence Act / Section 63 BSA 2023 Electronic Evidence Certificate</span>
                </div>
                <div className="p-2.5 rounded-lg bg-navy-950 border border-navy-800 font-mono text-[10px] text-slate-300 break-all">
                  SHA-256 HASH DIGEST: <span className="text-emerald-400 font-bold">{report.section_65b_digest}</span>
                </div>
                <p className="text-[10px] text-emerald-400/80">
                  {report.compliance_certification} &bull; Tamper-evident electronic record sealed at State Crime Record Bureau (SCRB), Gandhinagar.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-navy-800 bg-navy-950/70 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono">
            Report Ref: {report?.report_id || 'PENDING'}
          </span>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold shadow-glow-cyan flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Official Submission Dossier
          </button>
        </div>
      </div>
    </div>
  );
};
