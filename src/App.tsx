import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { Layout } from './components/layout/Layout';

// Pages
import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { CreateReportPage } from './pages/CreateReportPage';
import { ReportDetailsPage } from './pages/ReportDetailsPage';
import { MatchesPage } from './pages/MatchesPage';
import { MyReportsPage } from './pages/MyReportsPage';
import { SetupGuidePage } from './pages/SetupGuidePage';

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/browse" element={<BrowsePage />} />
              <Route path="/create" element={<CreateReportPage />} />
              <Route path="/reports/:id" element={<ReportDetailsPage />} />
              <Route path="/matches" element={<MatchesPage />} />
              <Route path="/my-reports" element={<MyReportsPage />} />
              <Route path="/setup" element={<SetupGuidePage />} />
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
