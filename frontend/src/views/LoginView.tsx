import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { authApi } from '../api/auth';
import { Button } from '../components/common/Button';
import { Shield, Lock, User as UserIcon, AlertCircle } from 'lucide-react';

export const LoginView: React.FC = () => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('GujaratPolice@2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setSession } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      const res = await authApi.login({ username, password });
      setSession(res);
      navigate('/');
    } catch (err: any) {
      console.warn('Login failure:', err);
      const detail = err.response?.data?.detail || err.message || 'Authentication failed. Please verify credentials.';
      setError(typeof detail === 'string' ? detail : 'Invalid username or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#090d16] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#0f172a] border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 p-0.5 mx-auto flex items-center justify-center">
            <div className="w-full h-full bg-[#0f172a] rounded-[10px] flex items-center justify-center">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white font-mono">
            NETRA<span className="text-cyan-400">BINDU</span>
          </h2>
          <p className="text-xs text-slate-400 font-mono">
            Gujarat Police CCTV Intelligence &amp; GIS Command
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-950/30 border border-rose-500/40 rounded-xl text-xs text-rose-300 flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs font-mono">
          <div>
            <label className="text-slate-400 block mb-1">Operator Identifier</label>
            <div className="relative">
              <UserIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-600"
              />
            </div>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Passcode / Key</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white placeholder-slate-600"
              />
            </div>
          </div>

          <Button type="submit" variant="primary" className="w-full" loading={loading}>
            Authenticate &amp; Enter Command Center
          </Button>

          <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 text-center text-[11px] text-slate-400">
            <span className="text-cyan-400 font-semibold">Default Operator:</span> <code className="text-white">admin</code> / <code className="text-white">GujaratPolice@2026</code>
          </div>
        </form>

        <div className="text-center text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800">
          Statutory Surveillance System • Restricted Law Enforcement Access
        </div>
      </div>
    </div>
  );
};
