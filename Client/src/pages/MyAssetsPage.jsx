import { useEffect, useState } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

export default function MyAssetsPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('it-asset-token');
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }

    api.get('/assets/me/assets')
      .then((response) => setAssets(response.data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load my assets'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card">Loading your assets...</div>;
  if (error) return <div className="card">{error}</div>;

  return (
    <div className="card">
      <h2>My Assets</h2>
      {assets.length === 0 ? <p>No assigned assets found.</p> : (
        <div className="grid">
          {assets.map((asset) => (
            <div key={asset.id} className="card">
              <strong>{asset.name}</strong>
              <p>Status: {asset.status}</p>
              <p>Location: {asset.location || 'N/A'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
