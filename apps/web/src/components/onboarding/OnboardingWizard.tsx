import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { CSVUploader } from './CSVUploader';
import { ManualCameraForm } from './ManualCameraForm';
import { ONVIFDiscoveryModal } from './ONVIFDiscoveryModal';
import { Camera, ONVIFDevice } from '../../types';
import { FileSpreadsheet, PlusCircle, Radio } from 'lucide-react';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (camera?: Camera) => void;
}

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [tab, setTab] = useState<'csv' | 'manual' | 'onvif'>('manual');
  const [discoveredDevice, setDiscoveredDevice] = useState<ONVIFDevice | null>(null);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Camera Ingestion & Onboarding Center"
      subtitle="Register heterogeneous feeds across departmental surveillance networks"
      size="lg"
    >
      <div className="space-y-4">
        {/* Tab Buttons */}
        <div className="flex items-center gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setTab('manual')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors ${
              tab === 'manual' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-3.5 h-3.5" /> Manual RTSP
          </button>
          <button
            onClick={() => setTab('csv')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors ${
              tab === 'csv' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Bulk CSV Import
          </button>
          <button
            onClick={() => setTab('onvif')}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-medium flex items-center justify-center gap-1.5 transition-colors ${
              tab === 'onvif' ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" /> ONVIF Discovery
          </button>
        </div>

        {/* Tab Contents */}
        {tab === 'manual' && (
          <ManualCameraForm
            initialValues={
              discoveredDevice
                ? {
                    vendor: discoveredDevice.vendor,
                    model: discoveredDevice.model,
                  }
                : {}
            }
            onSaveSuccess={(cam) => {
              onSuccess(cam);
              onClose();
            }}
          />
        )}

        {tab === 'csv' && (
          <CSVUploader
            onSuccess={() => {
              onSuccess();
              onClose();
            }}
          />
        )}

        {tab === 'onvif' && (
          <ONVIFDiscoveryModal
            isOpen={true}
            onClose={() => setTab('manual')}
            onSelectDevice={(dev) => {
              setDiscoveredDevice(dev);
              setTab('manual');
            }}
          />
        )}
      </div>
    </Modal>
  );
};
