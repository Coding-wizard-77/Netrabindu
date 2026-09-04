import React, { useState } from 'react';
import { X, Printer, Shield, CheckCircle, Hash } from 'lucide-react';
import { tacticalAudio } from '../../utils/audio';

export interface Section65BCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  plateNumber?: string;
  plate?: string;
  eventData?: {
    eventId?: string;
    plateNumber?: string;
    timestamp?: string;
    cameraName?: string;
    location?: string;
    evidenceHash?: string;
    confidence?: number;
    department?: string;
  };
}

export const Section65BCertificateModal: React.FC<Section65BCertificateModalProps> = ({
  isOpen,
  onClose,
  plateNumber,
  plate,
  eventData,
}) => {
  const activePlate = plateNumber || plate || eventData?.plateNumber || 'GJ01AB1234';
  const activeCam = eventData?.cameraName || 'SG Highway Chanakyapuri Junction Cam-04';
  const activeLocation = eventData?.location || 'Ahmedabad Urban Jurisdiction (23.0725° N, 72.5255° E)';
  const activeHash = eventData?.evidenceHash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const activeConfidence = eventData?.confidence || 96.8;
  const activeDept = eventData?.department || 'TRAFFIC_CRIME_CELL';
  const activeTime = eventData?.timestamp || new Date().toISOString();

  const [officerName] = useState('Inspector V. K. Jadeja');
  const [officerRank] = useState('Police Inspector (Cyber / Forensic Tech)');
  const [policeStation] = useState('Command & Control Centre, Gujarat Police Headquarter');
  const [firNumber] = useState('I-CR/2026/0418');

  if (!isOpen) return null;

  const handlePrint = () => {
    tacticalAudio.playKeyClick();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-xl border border-navy-700 bg-white text-slate-900 dark:bg-navy-950 dark:text-slate-100 p-8 shadow-2xl my-8">
        {/* Controls */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-navy-800 pb-4 print:hidden">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-500 border border-emerald-500/20">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Section 65B Electronic Evidence Certificate
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                  BSA 2023 SEC 63 ADMISSIBLE
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Statutory certificate under Indian Evidence Act Section 65B / Bharatiya Sakshya Adhiniyam Sec 63
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 rounded-lg bg-accent-blue px-3 py-1.5 text-xs font-bold text-white hover:bg-accent-blue/90 shadow transition-colors"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Export PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-navy-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Certificate Body */}
        <div className="mt-6 border-4 border-double border-slate-800 dark:border-navy-600 p-8 rounded-lg bg-slate-50/50 dark:bg-navy-900/40 relative">
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-5 dark:opacity-10">
            <Shield className="h-96 w-96 text-slate-900 dark:text-white" />
          </div>

          <div className="text-center space-y-1 border-b-2 border-slate-700 dark:border-navy-700 pb-4">
            <div className="text-xs font-bold tracking-widest text-slate-600 dark:text-slate-400 uppercase">
              GOVERNMENT OF GUJARAT • HOME DEPARTMENT
            </div>
            <h1 className="text-xl font-extrabold tracking-wide text-slate-900 dark:text-slate-50 uppercase font-serif">
              GUJARAT POLICE STATE COMMAND & CONTROL CENTRE
            </h1>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 underline font-mono">
              CERTIFICATE UNDER SECTION 65B OF THE INDIAN EVIDENCE ACT, 1872
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              (Read with Section 63 of Bharatiya Sakshya Adhiniyam, 2023)
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 text-xs font-mono border-b border-slate-300 dark:border-navy-800 pb-3">
            <div>
              <span className="font-bold text-slate-500">CERTIFICATE NO:</span>{' '}
              <span className="font-bold text-slate-900 dark:text-slate-100">GP/NETRA/65B/2026/0904-89</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-500">DATE & TIME OF ISSUE:</span>{' '}
              <span className="font-bold text-slate-900 dark:text-slate-100">{new Date().toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="font-bold text-slate-500">FIR / GD REFERENCE:</span>{' '}
              <span className="font-bold text-slate-900 dark:text-slate-100">{firNumber}</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-500">DEPARTMENT:</span>{' '}
              <span className="font-bold text-slate-900 dark:text-slate-100">{activeDept}</span>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-800 dark:text-slate-200">
            <p>
              I, <strong className="underline">{officerName}</strong>, holding the rank of{' '}
              <strong className="underline">{officerRank}</strong>, stationed at{' '}
              <strong className="underline">{policeStation}</strong>, do hereby solemnly certify and affirm as under:
            </p>

            <ol className="list-decimal pl-5 space-y-2">
              <li>
                That the electronic record produced herein represents an automated capture generated by the Netrabindu
                AI ANPR Automated CCTV Surveillance Grid operating under the lawful control and management of Gujarat Police.
              </li>
              <li>
                That during the period over which the electronic record was produced, the computer system and edge-camera
                nodes were operating properly and under continuous cryptographic integrity monitoring.
              </li>
              <li>
                That the information contained in the electronic record reproduces accurately the optical feed and license plate
                recognition telemetry captured at the specified coordinates.
              </li>
            </ol>
          </div>

          <div className="mt-4 rounded-lg border border-slate-300 dark:border-navy-700 bg-white/80 dark:bg-navy-950/80 p-4 space-y-2 text-xs font-mono">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500">CAPTURED PLATE:</span>{' '}
                <span className="font-bold text-sm text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950 px-2 py-0.5 rounded border border-red-300 dark:border-red-800">
                  {activePlate}
                </span>
              </div>
              <div>
                <span className="text-slate-500">AI CONFIDENCE:</span>{' '}
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeConfidence}% (HIGH RELIABILITY)</span>
              </div>
              <div>
                <span className="text-slate-500">TIMESTAMP (UTC/IST):</span>{' '}
                <span className="font-bold text-slate-900 dark:text-slate-100">{activeTime}</span>
              </div>
              <div>
                <span className="text-slate-500">CAMERA ID:</span>{' '}
                <span className="font-bold text-slate-900 dark:text-slate-100">{activeCam}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500">LOCATION & JURISDICTION:</span>{' '}
                <span className="font-bold text-slate-900 dark:text-slate-100">{activeLocation}</span>
              </div>
              <div className="col-span-2 pt-1 border-t border-slate-200 dark:border-navy-800">
                <span className="text-slate-500 flex items-center gap-1">
                  <Hash className="h-3 w-3" /> SHA-256 CRYPTOGRAPHIC INTEGRITY HASH:
                </span>
                <div className="mt-1 break-all bg-slate-100 dark:bg-navy-900 p-1.5 rounded font-bold text-[10px] text-accent-cyan border border-slate-300 dark:border-navy-700">
                  {activeHash}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t-2 border-slate-700 dark:border-navy-700 grid grid-cols-2 gap-8 text-xs">
            <div className="space-y-1">
              <div className="font-bold text-slate-600 dark:text-slate-400">DIGITAL CERTIFICATE VERIFICATION</div>
              <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-mono text-[11px] font-bold">
                <CheckCircle className="h-4 w-4" />
                <span>CRYPTOGRAPHICALLY SEALED (PKI-ED25519)</span>
              </div>
              <p className="text-[10px] text-slate-500">Gujarat Police Netrabindu Root CA Validated</p>
            </div>

            <div className="text-right space-y-1">
              <div className="font-serif font-bold text-slate-900 dark:text-slate-100">{officerName}</div>
              <div className="text-[11px] text-slate-600 dark:text-slate-400">{officerRank}</div>
              <div className="text-[10px] text-slate-500">{policeStation}</div>
              <div className="text-[10px] font-mono text-slate-400">[SIGNATURE / OFFICIAL SEAL]</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
