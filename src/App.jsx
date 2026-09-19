import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import AppShell from './components/layout/AppShell';
import TodayPage from './pages/TodayPage';
import SchedulePage from './pages/SchedulePage';
import AdvisorPage from './pages/AdvisorPage';
import GuidePage from './pages/GuidePage';
import PlansPage from './pages/PlansPage';

// Hash routes (#/schedule) keep deep links and the back button working on static hosting.
export default function App() {
  return (
    <HashRouter>
      <AppProvider>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<TodayPage />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="advisor" element={<AdvisorPage />} />
            <Route path="guide" element={<GuidePage />} />
            <Route path="plans" element={<PlansPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AppProvider>
    </HashRouter>
  );
}
