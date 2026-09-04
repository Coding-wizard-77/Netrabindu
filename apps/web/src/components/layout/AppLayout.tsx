import React, { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { SystemStatusBar } from './SystemStatusBar';
import { useAuthStore } from '../../store/useAuthStore';
import { wsManager } from '../../api/websocket';
import { useAlertStore } from '../../store/useAlertStore';
import { useUIStore } from '../../store/useUIStore';

export const AppLayout: React.FC = () => {
  const { isAuthenticated, initializeFromStorage } = useAuthStore();
  const { addLiveAlert } = useAlertStore();
  const { audioMuted } = useUIStore();
  const navigate = useNavigate();

  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);

  useEffect(() => {
    if (!isAuthenticated && !localStorage.getItem('netrabindu_access_token')) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Connect WebSocket on App Mount
  useEffect(() => {
    wsManager.connect();

    const unsubAlerts = wsManager.subscribe('alerts', (msg) => {
      if (msg.payload) {
        addLiveAlert(msg.payload, audioMuted);
      }
    });

    return () => {
      unsubAlerts();
    };
  }, [addLiveAlert, audioMuted]);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#090d16]">
      <SystemStatusBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-[#090d16]">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
