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
                  <p className="asset-id">{record.asset_id || 'Asset record'}</p>
                  <h3>{record.maintenance_type}</h3>
                </div>
                <span className={`status-badge ${record.completion_date ? 'available' : 'maintenance'}`}>
                  {record.completion_date ? 'Completed' : 'In Service'}
                </span>
              </div>
              
              <div className="card-details">
                <p><strong>Performed by</strong> <span>{record.performed_by_name || `User: ${record.performed_by}`}</span></p>
                <p><strong>Service Date</strong> <span>{record.performed_at ? new Date(record.performed_at).toLocaleDateString() : 'N/A'}</span></p>
                {record.completion_date && (
                  <p><strong>Completion Date</strong> <span>{new Date(record.completion_date).toLocaleDateString()}</span></p>
                )}
                {record.cost > 0 && (
                  <p><strong>Cost</strong> <span>₹{Number(record.cost).toLocaleString('en-IN')}</span></p>
                )}
                {record.technician && (
                  <p><strong>Technician/Vendor</strong> <span>{record.technician}</span></p>
                )}
              </div>

              <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <p style={{ fontSize: '0.85rem', marginBottom: '0.4rem', lineHeight: '1.4' }}>
                  <strong>Description:</strong> <span style={{ color: 'var(--text-secondary)' }}>{record.description}</span>
                </p>
                {record.remarks && (
                  <p style={{ fontSize: '0.85rem', lineHeight: '1.4' }}>
                    <strong>Remarks:</strong> <span style={{ color: 'var(--text-secondary)' }}>{record.remarks}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
