import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import AssetsPage from '../pages/AssetsPage';
import MyAssetsPage from '../pages/MyAssetsPage';
import CategoriesPage from '../pages/CategoriesPage';
import MaintenancePage from '../pages/MaintenancePage';
import MainLayout from '../layouts/MainLayout';
import SettingsPage from '../pages/SettingsPage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="container">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route
          path="assets"
          element={
            <RoleRoute allowedRoles={['user', 'asset_manager', 'admin']}>
              <AssetsPage />
            </RoleRoute>
          }
        />
        <Route
          path="my-assets"
          element={
            <RoleRoute allowedRoles={['user', 'asset_manager', 'admin']}>
              <MyAssetsPage />
            </RoleRoute>
          }
        />
        <Route
          path="categories"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <CategoriesPage />
            </RoleRoute>
          }
        />
        <Route
          path="maintenance"
          element={
            <RoleRoute allowedRoles={['asset_manager', 'admin']}>
              <MaintenancePage />
            </RoleRoute>
          }
        />
        <Route
          path="settings"
          element={
            <RoleRoute allowedRoles={['admin']}>
              <SettingsPage />
            </RoleRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
