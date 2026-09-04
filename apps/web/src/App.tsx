import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { DashboardView } from './views/DashboardView';
import { CameraRegistryView } from './views/CameraRegistryView';
import { LiveViewMatrixView } from './views/LiveViewMatrixView';
import { EventsView } from './views/EventsView';
import { InvestigationView } from './views/InvestigationView';
import { AlertsView } from './views/AlertsView';
import { WatchlistsView } from './views/WatchlistsView';
import { HealthView } from './views/HealthView';
import { AuditView } from './views/AuditView';
import { LoginView } from './views/LoginView';
import { FirstRunSetupView } from './views/FirstRunSetupView';

export const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />
      <Route path="/setup" element={<FirstRunSetupView />} />

      <Route path="/" element={<AppLayout />}>
        <Route index element={<DashboardView />} />
        <Route path="cameras" element={<CameraRegistryView />} />
        <Route path="live" element={<LiveViewMatrixView />} />
        <Route path="events" element={<EventsView />} />
        <Route path="investigation" element={<InvestigationView />} />
        <Route path="alerts" element={<AlertsView />} />
        <Route path="watchlists" element={<WatchlistsView />} />
        <Route path="health" element={<HealthView />} />
        <Route path="audit" element={<AuditView />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
