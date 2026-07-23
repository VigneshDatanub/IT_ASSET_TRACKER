import { useEffect, useState } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

const getInitialForm = (asset, categories = []) => ({
  asset_id: asset?.asset_id || '',
  name: asset?.name || '',
  description: asset?.description || '',
  category_id: asset?.category_id?.toString() || categories[0]?.id?.toString() || '',
  purchase_date: asset?.purchase_date ? asset.purchase_date.split('T')[0] : '',
  purchase_cost: asset?.purchase_cost?.toString() || '0',
  status: asset?.status || 'Available',
  location: asset?.location || ''
});

export default function AssetForm({ asset, onSaved, onCancel }) {
  const [form, setForm] = useState(getInitialForm(asset));
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('it-asset-token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    api.get('/categories', { headers })
      .then((response) => setCategories(response.data.data || []))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    setForm(getInitialForm(asset, categories));
    setMessage('');
  }, [asset, categories]);

  const handleChange = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('it-asset-token');
    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const payload = {
        ...form,
        category_id: Number(form.category_id),
        purchase_cost: Number(form.purchase_cost)
      };

      if (asset?.id) {
        await api.put(`/assets/${asset.id}`, payload, { headers });
        alert('Asset updated successfully');
      } else {
        await api.post('/assets', payload, { headers });
        alert('Asset created successfully');
      }
      onSaved?.();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to save asset');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content animate-slide-up">
        <div className="modal-header">
          <h3>{asset?.id ? 'Edit Asset details' : 'Register New Asset'}</h3>
          <button type="button" className="modal-close" onClick={onCancel}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          {message ? <p className="form-error">{message}</p> : null}
          
          <div className="form-group">
            <label>Asset Serial ID</label>
            <input name="asset_id" value={form.asset_id} onChange={handleChange} placeholder="e.g. ASSET-1024" required />
          </div>
          
          <div className="form-group">
            <label>Asset Display Name</label>
            <input name="name" value={form.name} onChange={handleChange} placeholder="e.g. Dell Latitude 5440" required />
          </div>
          
          <div className="form-group">
            <label>Specifications & Description</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="e.g. Intel i7, 16GB RAM, 512GB SSD" rows={2} />
          </div>
          
          <div className="form-group">
            <label>Asset Category Group</label>
            <select name="category_id" value={form.category_id} onChange={handleChange} required>
              <option value="">Select category...</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Purchase Date</label>
            <input name="purchase_date" type="date" value={form.purchase_date} onChange={handleChange} required />
          </div>
          
          <div className="form-group">
            <label>Purchase Valuation ($)</label>
            <input name="purchase_cost" type="number" step="0.01" value={form.purchase_cost} onChange={handleChange} placeholder="0.00" required />
          </div>
          
          <div className="form-group">
            <label>Initial Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="Available">Available</option>
              <option value="Assigned">Assigned</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Lost">Lost</option>
              <option value="Damaged">Damaged</option>
              <option value="Retired">Retired</option>
              <option value="Disposed">Disposed</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Physical Storage Location</label>
            <input name="location" value={form.location} onChange={handleChange} placeholder="e.g. Main Office Rack C" />
          </div>
          
          <div className="button-row" style={{ marginTop: '1.5rem' }}>
            <button type="button" className="secondary" onClick={onCancel}>Cancel</button>
            <button type="submit" className="primary">{asset?.id ? 'Save Changes' : 'Confirm Registration'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
