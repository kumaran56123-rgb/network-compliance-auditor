import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { Layout } from './components/Layout.tsx';
import { UploadPage } from './pages/UploadPage.tsx';
import { ConfigurePage } from './pages/ConfigurePage.tsx';
import { DashboardPage } from './pages/DashboardPage.tsx';
import { AuditDetailPage } from './pages/AuditDetailPage.tsx';
import { ComparisonPage } from './pages/ComparisonPage.tsx';
import { ReportsPage } from './pages/ReportsPage.tsx';
import { NotFoundPage } from './pages/NotFoundPage.tsx';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/upload" replace />} />
        <Route path="/upload" element={<Layout><UploadPage /></Layout>} />
        <Route path="/configure" element={<Layout><ConfigurePage /></Layout>} />
        <Route path="/dashboard" element={<Layout><DashboardPage /></Layout>} />
        <Route path="/audit/:deviceId" element={<Layout><AuditDetailPage /></Layout>} />
        <Route path="/compare" element={<Layout><ComparisonPage /></Layout>} />
        <Route path="/reports" element={<Layout><ReportsPage /></Layout>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}