import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { camerasApi } from '../../api/cameras';
import { ONVIFDevice } from '../../types';
import { Radio, Search, CheckCircle, Plus } from 'lucide-react';

interface ONVIFDiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDevice: (device: ONVIFDevice) => void;
}

export const ONVIFDiscoveryModal: React.FC<ONVIFDiscoveryModalProps> = ({
  isOpen,
  onClose,
  onSelectDevice,
}) => {
  const [loading, setLoading] = useState(false);
  const [devices, setDevices] = useState<ONVIFDevice[]>([]);

  const startDiscovery = async () => {
    try {
      setLoading(true);
      const res = await camerasApi.discoverONVIF();
      setDevices(res);
    } catch (err) {
      console.error('Discovery error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="ONVIF Auto-Discovery Probe"
      subtitle="Scan local network segment for compliant IP cameras"
      size="lg"
    >
      <div className="space-y-4">
        <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="text-xs text-slate-300 font-mono">
            Sends WS-Discovery multicast probe across local network VLANs.
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={<Search className="w-3.5 h-3.5" />}
            onClick={startDiscovery}
            loading={loading}
          >
            {loading ? 'Scanning Network...' : 'Start Discovery'}
          </Button>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {devices.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-slate-500 bg-slate-950 rounded-xl border border-slate-800">
              {loading ? 'Listening for ONVIF device responses...' : 'Click Start Discovery to scan reachable cameras.'}
            </div>
          ) : (
            devices.map((dev) => (
              <div
                key={dev.device_id}
                className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 hover:border-cyan-500/40 flex items-center justify-between"
              >
                <div>
                  <div className="font-mono text-xs font-bold text-white">
                    {dev.ip}:{dev.port} ({dev.vendor} {dev.model})
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 truncate max-w-md">
                    Stream: {dev.stream_uris[0] || 'Auto-negotiated URI'}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="tactical"
                  icon={<Plus className="w-3 h-3" />}
                  onClick={() => {
                    onSelectDevice(dev);
                    onClose();
                  }}
                >
                  Onboard
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
