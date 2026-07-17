import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ assets: 0, categories: 0, maintenance: 0 });
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
        setStats({
          assets: assetsResponse.data.data?.length || 0,
          categories: categoriesResponse.data.data?.length || 0,
          maintenance: maintenanceResponse.data.data?.length || 0
        });
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card">Loading dashboard...</div>;
  if (error) return <div className="card">{error}</div>;

  return (
    <div className="grid">
      <div className="card">
        <h3>Welcome</h3>
        <p>{user?.username || 'User'} signed in as {user?.role || 'role'}.</p>
      </div>
      <div className="card">
        <h3>Asset Count</h3>
        <p>{stats.assets}</p>
      </div>
      <div className="card">
        <h3>Categories</h3>
        <p>{stats.categories}</p>
      </div>
      <div className="card">
        <h3>Maintenance Records</h3>
        <p>{stats.maintenance}</p>
      </div>
    </div>
  );
}
