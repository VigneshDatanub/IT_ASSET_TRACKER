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
    <div className="card">
      <h2>Maintenance</h2>
      <div className="grid">
        {records.map((record) => (
          <div key={record.id} className="card">
            <strong>{record.maintenance_type}</strong>
            <p>{record.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
