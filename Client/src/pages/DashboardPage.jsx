import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ assets: 0, categories: 0, maintenance: 0, available: 0, assigned: 0, maintenanceStatus: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('it-asset-token');
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }

    Promise.all([
      api.get('/assets'),
      api.get('/categories'),
      api.get('/maintenance')
    ])
      .then(([assetsResponse, categoriesResponse, maintenanceResponse]) => {
        const assets = assetsResponse.data.data || [];
        const statusCounts = assets.reduce(
          (acc, asset) => {
            if (asset.status === 'Assigned') acc.assigned += 1;
            if (asset.status === 'Available') acc.available += 1;
            if (asset.status === 'Maintenance') acc.maintenanceStatus += 1;
            return acc;
          },
          { assigned: 0, available: 0, maintenanceStatus: 0 }
        );

        setStats({
          assets: assets.length,
          categories: categoriesResponse.data.data?.length || 0,
          maintenance: maintenanceResponse.data.data?.length || 0,
          assigned: statusCounts.assigned,
          available: statusCounts.available,
          maintenanceStatus: statusCounts.maintenanceStatus
        });
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card">Loading dashboard...</div>;
  if (error) return <div className="card">{error}</div>;

  return (
    <div className="dashboard-grid">
      <div className="card welcome-card">
        <h3>Welcome back, {user?.username || 'User'}</h3>
        <p>You are signed in as <strong>{user?.role?.replace('_', ' ') || 'Guest'}</strong>.</p>
        <p>Use the navigation above to manage assets, categories, and maintenance based on your role.</p>
      </div>
      <div className="card stat-card">
        <h4>Assets</h4>
        <p className="stat-value">{stats.assets}</p>
      </div>
      <div className="card stat-card">
        <h4>Categories</h4>
        <p className="stat-value">{stats.categories}</p>
      </div>
      <div className="card stat-card">
        <h4>Maintenance</h4>
        <p className="stat-value">{stats.maintenance}</p>
      </div>
      <div className="card status-card">
        <h4>Asset status overview</h4>
        <div className="status-row">
          <span className="status-badge available">Available</span>
          <span>{stats.available}</span>
        </div>
        <div className="status-row">
          <span className="status-badge assigned">Assigned</span>
          <span>{stats.assigned}</span>
        </div>
        <div className="status-row">
          <span className="status-badge maintenance">In Maintenance</span>
          <span>{stats.maintenanceStatus}</span>
        </div>
      </div>
    </div>
  );
}
