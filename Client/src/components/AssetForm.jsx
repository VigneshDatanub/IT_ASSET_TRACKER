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

export default function AssetForm({ asset, onSaved }) {
  const [form, setForm] = useState(getInitialForm(asset));
  const [message, setMessage] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get('/categories')
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
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }

    try {
      const payload = {
        ...form,
        category_id: Number(form.category_id),
        purchase_cost: Number(form.purchase_cost)
      };

      if (asset?.id) {
        await api.put(`/assets/${asset.id}`, payload);
        setMessage('Asset updated successfully');
      } else {
        await api.post('/assets', payload);
        setMessage('Asset created successfully');
      }

      setForm(getInitialForm(null, categories));
      onSaved?.();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to save asset');
    }
  };

  return (
    <form className="card form-panel" onSubmit={handleSubmit}>
      <h3>{asset?.id ? 'Edit Asset' : 'Create Asset'}</h3>
      {message ? <p className="form-message">{message}</p> : null}
      <div className="form-group">
        <label>Asset ID</label>
        <input name="asset_id" value={form.asset_id} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} rows={3} />
      </div>
      <div className="form-group">
        <label>Category</label>
        <select name="category_id" value={form.category_id} onChange={handleChange} required>
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Purchase Date</label>
          <input name="purchase_date" type="date" value={form.purchase_date} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Purchase Cost</label>
          <input name="purchase_cost" type="number" value={form.purchase_cost} onChange={handleChange} required />
        </div>
      </div>
      <div className="form-group">
        <label>Status</label>
        <select name="status" value={form.status} onChange={handleChange}>
          <option value="Available">Available</option>
          <option value="Assigned">Assigned</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Retired">Retired</option>
        </select>
      </div>
      <div className="form-group">
        <label>Location</label>
        <input name="location" value={form.location} onChange={handleChange} />
      </div>
      <button type="submit">{asset?.id ? 'Save Changes' : 'Create Asset'}</button>
    </form>
  );
}
