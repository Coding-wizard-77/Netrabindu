import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { DetectionEvent, VehicleRoutePoint } from '../../types';
import { formatToIST } from '../../utils/date';
import { ShieldCheck, Printer, Download, FileText, CheckCircle } from 'lucide-react';

interface Section65BCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  event?: DetectionEvent | VehicleRoutePoint | null;
  plateNumber?: string;
}

export const Section65BCertificateModal: React.FC<Section65BCertificateModalProps> = ({
  isOpen,
  onClose,
  event,
  plateNumber = 'GJ01AB1234',
}) => {
  const [officerName, setOfficerName] = useState('Inspector V. K. Jadeja');
  const [officerRank, setOfficerRank] = useState('Police Inspector (PI)');
  const [policeStation, setPoliceStation] = useState('Navrangpura Police Station, Ahmedabad');
  const [firNumber, setFirNumber] = useState('CR No. I-142/2026');
  const [courtName, setCourtName] = useState('Hon\'ble Metropolitan Magistrate Court No. 4, Ahmedabad');

  const certNumber = `GJ-POL-65B-${Date.now().toString().slice(-7)}`;
  const sha256Hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Statutory Electronic Evidence Certificate"
      subtitle="Under Section 65B Indian Evidence Act / Section 63 Bharatiya Sakshya Adhiniyam, 2023"
      size="xl"
    >
      <div className="space-y-4">
        {/* Officer Config Bar (No-Print) */}
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono no-print">
          <div>
            <label className="text-slate-400 block mb-1">Investigating Officer (IO)</label>
            <input
              type="text"
              value={officerName}
              onChange={(e) => setOfficerName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">FIR / Crime Register No.</label>
            <input
              type="text"
              value={firNumber}
              onChange={(e) => setFirNumber(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-1">Police Station Jurisdiction</label>
            <input
              type="text"
              value={policeStation}
              onChange={(e) => setPoliceStation(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-white"
            />
          </div>
        </div>

        {/* Certificate Formal Document View */}
        <div className="p-8 bg-white text-slate-900 rounded-xl shadow-2xl border border-slate-300 font-serif leading-relaxed text-sm print:m-0 print:p-0 print:border-none">
          {/* Official Letterhead */}
          <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-700">
              GOVERNMENT OF GUJARAT • DEPARTMENT OF HOME AFFAIRS
            </div>
            <h1 className="text-xl font-bold uppercase tracking-tight text-slate-950 mt-1 font-sans">
              GUJARAT POLICE DEPARTMENT
            </h1>
            <h2 className="text-sm font-semibold text-slate-800 font-sans">
              STATE INTEGRATED CCTV COMMAND &amp; CONTROL NETWORK (NETRABINDU)
            </h2>
            <div className="text-xs text-slate-600 mt-1 italic font-sans">
              Certificate No: <strong className="text-slate-900">{certNumber}</strong> • Date of Issue: {formatToIST(new Date().toISOString(), 'dd MMMM yyyy')}
            </div>
          </div>

          <div className="text-center font-bold text-base uppercase underline mb-4">
            CERTIFICATE UNDER SECTION 65B OF THE INDIAN EVIDENCE ACT, 1872 / SECTION 63 OF BHARATIYA SAKSHYA ADHINIYAM, 2023
          </div>

          <p className="mb-4">
            I, <strong>{officerName}</strong>, holding the rank of <strong>{officerRank}</strong>, currently posted at <strong>{policeStation}</strong>, do hereby solemnly affirm and certify under statutory provisions as follows:
          </p>

          <ol className="list-decimal pl-6 space-y-3 mb-6">
            <li>
              That I am the authorized officer responsible for operating and extracting electronic surveillance records from the <strong>NetraBindu CCTV Intelligence Grid</strong> of Gujarat Police.
            </li>
            <li>
              That the electronic record(s) relating to target vehicle registration plate <strong>{plateNumber}</strong> were captured by automated edge sensors during the regular and lawful course of statutory surveillance activities.
            </li>
            <li>
              That throughout the material period, the surveillance hardware, media transmission gateways, and central cryptographic database were operating properly without any tampering, manipulation, or unauthorized interception.
            </li>
            <li>
              That the optical character recognition (OCR) and high-resolution video frame evidence produced hereunder is a true, authentic, and bit-exact reproduction of the electronic record stored on the secured government cluster.
            </li>
          </ol>

          {/* Technical Evidence Record Details */}
          <div className="p-4 bg-slate-100 rounded-lg border border-slate-300 font-mono text-xs mb-6 space-y-1.5">
            <div className="font-bold text-slate-900 uppercase border-b border-slate-300 pb-1 mb-2">
              Evidentiary Hash &amp; Hardware Record Summary
            </div>
            <div>Case Reference: <strong>{firNumber}</strong></div>
            <div>Jurisdiction Court: <strong>{courtName}</strong></div>
            <div>Target License Plate: <strong className="text-slate-950">{plateNumber}</strong></div>
            <div>Camera Identifier: <strong>CAM-SG-HWY-04 (S.G. Highway Junction 04)</strong></div>
            <div>Timestamp of Observation: <strong>{formatToIST(new Date().toISOString())}</strong></div>
            <div>Cryptographic Hash (SHA-256): <strong className="text-blue-900">{sha256Hash}</strong></div>
            <div>Digital Watermark: <strong>SEALED &amp; VERIFIED BY GUJARAT POLICE STATE CORE</strong></div>
          </div>

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs font-sans">
            <div>
              <div className="border-b border-slate-400 w-48 mx-auto mb-1"></div>
              <div className="font-bold">System Operator / Technical In-Charge</div>
              <div className="text-slate-600">NetraBindu Command Center, Gandhinagar</div>
            </div>
            <div>
              <div className="border-b border-slate-400 w-48 mx-auto mb-1"></div>
              <div className="font-bold">{officerName}</div>
              <div className="text-slate-600">{officerRank}, {policeStation}</div>
            </div>
          </div>
        </div>

        {/* Action Controls (No-Print) */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800 no-print">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="tactical"
            icon={<Printer className="w-4 h-4" />}
            onClick={handlePrint}
          >
            Print Certified Evidence Dossier
          </Button>
        </div>
      </div>
    </Modal>
  );
};
