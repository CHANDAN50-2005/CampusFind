import { Navigate, Route, Routes } from 'react-router';
import { AppShell } from './components/AppShell.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { BrowsePage, MyReportsPage, ItemDetailsPage } from './pages/ItemsPage.jsx';
import { ReportPage } from './pages/ReportPage.jsx';
import { PlaceholderPage } from './pages/PlaceholderPage.jsx';
import { AuthPage } from './pages/AuthPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/lost" element={<BrowsePage type="lost" />} />
        <Route path="/found" element={<BrowsePage type="found" />} />
        <Route path="/report" element={<ReportPage />} />
        <Route path="/items/:itemId" element={<ItemDetailsPage />} />
        <Route path="/my-reports" element={<MyReportsPage />} />
        <Route path="/matches" element={<PlaceholderPage page="matches" />} />
        <Route path="/claims" element={<PlaceholderPage page="claims" />} />
        <Route path="/notifications" element={<PlaceholderPage page="notifications" />} />
        <Route path="/admin" element={<PlaceholderPage page="admin" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
