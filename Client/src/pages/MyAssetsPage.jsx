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
    <div>
      <div className="top-panel">
        <div>
          <h2>My Assets</h2>
          <p>Only assets assigned to you are shown here so you can quickly see what you currently hold.</p>
        </div>
      </div>
      {assets.length === 0 ? (
        <div className="card">No assigned assets found.</div>
      ) : (
        <div className="grid">
          {assets.map((asset) => (
            <div key={asset.id} className="card asset-card">
              <div className="card-header">
                <div>
                  <p className="asset-id">{asset.asset_id}</p>
                  <h3>{asset.name}</h3>
                </div>
                <span className={`status-badge ${asset.status.toLowerCase()}`}>{asset.status}</span>
              </div>
              <p>{asset.description || 'No description available.'}</p>
              <p><strong>Location:</strong> {asset.location || 'N/A'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
