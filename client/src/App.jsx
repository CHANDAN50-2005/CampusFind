import { Navigate, Route, Routes } from 'react-router';
import { RequireAdmin, RequireAuth } from './context/AuthContext.jsx';
import { AppShell } from './components/AppShell.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { BrowsePage, MyReportsPage, ItemDetailsPage } from './pages/ItemsPage.jsx';
import { ReportPage } from './pages/ReportPage.jsx';
import { AuthPage } from './pages/AuthPage.jsx';
import { AdminPage } from './pages/AdminPage.jsx';
import { ClaimsPage, MatchesPage, NotificationsPage } from './pages/WorkflowPages.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route element={<RequireAuth><AppShell /></RequireAuth>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/lost" element={<BrowsePage type="lost" />} />
        <Route path="/found" element={<BrowsePage type="found" />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/items/:itemId" element={<ItemDetailsPage />} />
        <Route path="/my-reports" element={<MyReportsPage />} />
        <Route path="/matches" element={<MatchesPage />} />
        <Route path="/claims" element={<ClaimsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
