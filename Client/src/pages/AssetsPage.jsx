import { useEffect, useState } from 'react';
import axios from 'axios';
import AssetForm from '../components/AssetForm';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingAsset, setEditingAsset] = useState(null);

  const loadAssets = () => {
    const token = localStorage.getItem('it-asset-token');
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }

    setLoading(true);
    api.get('/assets')
      .then((response) => setAssets(response.data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load assets'))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (assetId) => {
    try {
      await api.delete(`/assets/${assetId}`);
      loadAssets();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete asset');
    }
  };

  useEffect(() => {
    loadAssets();
  }, []);

  if (loading) return <div className="card">Loading assets...</div>;
  if (error) return <div className="card">{error}</div>;

  return (
    <div>
      <div className="card">
        <h2>Assets</h2>
        <div className="grid">
          {assets.map((asset) => (
            <div key={asset.id} className="card">
              <strong>{asset.asset_id}</strong>
              <p>{asset.name}</p>
              <p>Status: {asset.status}</p>
              <p>Location: {asset.location || 'N/A'}</p>
              <div className="button-row">
                <button type="button" onClick={() => setEditingAsset(asset)}>Edit</button>
                <button type="button" onClick={() => handleDelete(asset.id)} className="secondary">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <AssetForm
        asset={editingAsset}
        onSaved={() => {
          loadAssets();
          setEditingAsset(null);
        }}
      />
    </div>
  );
}
