import { useEffect, useState } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

export default function MaintenancePage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('it-asset-token');
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }

    api.get('/maintenance')
      .then((response) => setRecords(response.data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load maintenance records'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="card">Loading maintenance...</div>;
  if (error) return <div className="card">{error}</div>;

  return (
    <div>
      <div className="top-panel">
        <div>
          <h2>Maintenance Records</h2>
          <p>Review maintenance history and track the service status of critical assets.</p>
        </div>
      </div>
      {records.length === 0 ? (
        <div className="card">No maintenance records found.</div>
      ) : (
        <div className="grid">
          {records.map((record) => (
            <div key={record.id} className="card asset-card">
              <div className="card-header">
                <div>
                  <p className="asset-id">{record.maintenance_type}</p>
                  <h3>{record.asset_id || 'Asset record'}</h3>
                </div>
                <span className="status-badge maintenance">In Service</span>
              </div>
              <p className="card-description">{record.description}</p>
              <div className="card-details">
                <p><strong>Performed by</strong> <span>{record.performed_by_name || `User: ${record.performed_by}`}</span></p>
                <p><strong>Date</strong> <span>{new Date(record.performed_at).toLocaleDateString()}</span></p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
