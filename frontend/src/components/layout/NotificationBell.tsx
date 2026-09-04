import React, { useState } from 'react';
import { Bell, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import { useAlertStore } from '../../store/useAlertStore';
import { formatToIST } from '../../utils/date';
import { useNavigate } from 'react-router-dom';

export const NotificationBell: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { activeAlerts, unreadCount, markAsRead } = useAlertStore();
  const navigate = useNavigate();

  const handleOpen = () => {
    setOpen(!open);
    if (!open) {
      markAsRead();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-[#0f172a] border border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <span className="text-xs font-semibold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Live Incident Alerts
              </span>
              <button
                onClick={() => {
                  setOpen(false);
                  navigate('/alerts');
                }}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
              >
                View all <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
              {activeAlerts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-500 font-mono">
                  No active high-priority alerts
                </div>
              ) : (
                activeAlerts.slice(0, 8).map((alert) => (
                  <div
                    key={alert.id}
                    onClick={() => {
                      setOpen(false);
                      navigate('/alerts');
                    }}
                    className="p-3 hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-400 font-mono">
                        {alert.watchlist_category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formatToIST(alert.occurred_at, 'HH:mm:ss')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 mt-1 font-mono font-semibold">
                      Target: {alert.target_identifier} (Matched: {alert.detected_identifier})
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {alert.camera_name} • {alert.department_name}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
