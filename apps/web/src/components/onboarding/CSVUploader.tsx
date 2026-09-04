import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button';
import { camerasApi } from '../../api/cameras';

interface CSVUploaderProps {
  onSuccess: () => void;
}

export const CSVUploader: React.FC<CSVUploaderProps> = ({ onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ total: number; imported: number; failed: number; errors: any[] } | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = async () => {
    if (!file) return;
    try {
      setLoading(true);
      const res = await camerasApi.importCsv(file);
      setResult(res);
      if (res.imported > 0) {
        onSuccess();
      }
    } catch (err) {
      console.error('CSV import error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => fileInputRef.current?.click()}
        className="p-8 border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-xl bg-slate-900/40 text-center cursor-pointer transition-colors"
      >
        <input
          type="file"
          ref={fileInputRef}
          accept=".csv"
          className="hidden"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
        <Upload className="w-10 h-10 text-cyan-400 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-slate-200">
          {file ? file.name : 'Upload Camera Inventory CSV'}
        </h4>
        <p className="text-xs text-slate-400 mt-1 font-mono">
          Headers: camera_code, name, department_code, latitude, longitude, vendor, model, source_type, protocol, endpoint, username, retention_days, analytics_profile
        </p>
      </div>

      {file && (
        <div className="flex justify-end">
          <Button variant="primary" onClick={handleUpload} loading={loading}>
            Start Batch Import
          </Button>
        </div>
      )}

      {result && (
        <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs font-mono space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold">
            <CheckCircle className="w-4 h-4" />
            Import Completed: {result.imported} of {result.total} cameras successfully onboarded.
          </div>
          {result.failed > 0 && (
            <div className="text-rose-400">
              {result.failed} records failed validation. Check credentials and format.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
