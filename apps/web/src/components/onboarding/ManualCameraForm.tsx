import React, { useState } from 'react';
import { Camera, CameraValidationResult } from '../../types';
import { Button } from '../common/Button';
import { ConnectivityProbeVisualizer } from './ConnectivityProbeVisualizer';
import { camerasApi } from '../../api/cameras';

interface ManualCameraFormProps {
  initialValues?: Partial<Camera>;
  onSaveSuccess: (camera: Camera) => void;
}

export const ManualCameraForm: React.FC<ManualCameraFormProps> = ({
  initialValues = {},
  onSaveSuccess,
}) => {
  const [form, setForm] = useState({
    camera_code: initialValues.camera_code || 'CAM-' + Math.floor(100 + Math.random() * 900),
    name: initialValues.name || '',
    department_id: initialValues.department_id || 'dept-traffic',
    lat: initialValues.location?.lat || 23.0225,
    lon: initialValues.location?.lon || 72.5714,
    address: initialValues.address || '',
    vendor: initialValues.vendor || 'Hikvision',
    model: initialValues.model || 'DS-2CD2043G2',
    source_type: initialValues.source_type || 'DIRECT_RTSP',
    protocol: initialValues.protocol || 'RTSP',
    endpoint: 'rtsp://192.168.1.100:554/live/ch0',
    username: '',
    password: '',
    retention_days: initialValues.retention_days || 30,
    analytics_profile: initialValues.analytics_profile || 'ANPR',
  });

  const [probing, setProbing] = useState(false);
  const [probeResult, setProbeResult] = useState<CameraValidationResult | null>(null);
  const [saving, setSaving] = useState(false);

  const handleTestConnection = async () => {
    try {
      setProbing(true);
      const res = await camerasApi.testDirectEndpoint({
        endpoint: form.endpoint,
        username: form.username,
        password: form.password,
        protocol: form.protocol,
      });
      setProbeResult(res);
    } catch (e) {
      setProbeResult({ status: 'FAILED', error: 'Could not connect to source' });
    } finally {
      setProbing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await camerasApi.createCamera({
        camera_code: form.camera_code,
        name: form.name,
        department_id: form.department_id,
        location: { lat: Number(form.lat), lon: Number(form.lon) },
        address: form.address,
        vendor: form.vendor,
        model: form.model,
        source_type: form.source_type as any,
        protocol: form.protocol as any,
        endpoint: form.endpoint,
        username: form.username,
        password: form.password,
        retention_days: Number(form.retention_days),
        analytics_profile: form.analytics_profile as any,
        status: probeResult?.status === 'SUCCESS' ? 'ONLINE' : 'UNKNOWN',
      });
      onSaveSuccess(res);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-slate-400 block mb-1">Camera Code (Unique)</label>
          <input
            type="text"
            required
            value={form.camera_code}
            onChange={(e) => setForm({ ...form, camera_code: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
          />
        </div>
        <div>
          <label className="text-slate-400 block mb-1">Camera Display Name</label>
          <input
            type="text"
            required
            placeholder="e.g. S.G. Highway Junction 04"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
          />
        </div>
      </div>

      <div>
        <label className="text-slate-400 block mb-1">RTSP Stream Endpoint / IP URI</label>
        <div className="flex gap-2">
          <input
            type="text"
            required
            value={form.endpoint}
            onChange={(e) => setForm({ ...form, endpoint: e.target.value })}
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
          />
          <Button type="button" variant="secondary" onClick={handleTestConnection} loading={probing}>
            Test Probe
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-slate-400 block mb-1">Camera Username</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
          />
        </div>
        <div>
          <label className="text-slate-400 block mb-1">Camera Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-slate-400 block mb-1">Latitude</label>
          <input
            type="number"
            step="any"
            value={form.lat}
            onChange={(e) => setForm({ ...form, lat: parseFloat(e.target.value) })}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
          />
        </div>
        <div>
          <label className="text-slate-400 block mb-1">Longitude</label>
          <input
            type="number"
            step="any"
            value={form.lon}
            onChange={(e) => setForm({ ...form, lon: parseFloat(e.target.value) })}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-slate-400 block mb-1">Analytics Profile</label>
          <select
            value={form.analytics_profile}
            onChange={(e) => setForm({ ...form, analytics_profile: e.target.value as any })}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
          >
            <option value="ANPR">ANPR (Vehicle + Plate OCR)</option>
            <option value="PERSON">Person & Re-ID Intelligence</option>
            <option value="VEHICLE">Vehicle Tracking Only</option>
            <option value="NONE">Pass-Through Video Only</option>
          </select>
        </div>
        <div>
          <label className="text-slate-400 block mb-1">Retention Period (Days)</label>
          <input
            type="number"
            value={form.retention_days}
            onChange={(e) => setForm({ ...form, retention_days: parseInt(e.target.value) })}
            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-white"
          />
        </div>
      </div>

      <ConnectivityProbeVisualizer result={probeResult} loading={probing} />

      <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
        <Button type="submit" variant="primary" loading={saving}>
          Save & Register Camera
        </Button>
      </div>
    </form>
  );
};
