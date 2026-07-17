import { useEffect, useState } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

const getInitialForm = (category) => ({
  name: category?.name || '',
  description: category?.description || '',
  isActive: category?.isActive ?? category?.is_active ?? true
});

export default function CategoryForm({ category, onSaved }) {
  const [form, setForm] = useState(getInitialForm(category));
  const [message, setMessage] = useState('');

  useEffect(() => {
    setForm(getInitialForm(category));
    setMessage('');
  }, [category]);

  const handleChange = (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setForm({ ...form, [event.target.name]: value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('it-asset-token');
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }

    try {
      if (category?.id) {
        await api.put(`/categories/${category.id}`, {
          ...form,
          isActive: form.isActive
        });
        setMessage('Category updated successfully');
      } else {
        await api.post('/categories', {
          ...form,
          isActive: form.isActive
        });
        setMessage('Category created successfully');
      }
      setForm(getInitialForm(null));
      onSaved?.();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to save category');
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h3>{category?.id ? 'Edit Category' : 'Create Category'}</h3>
      {message ? <p>{message}</p> : null}
      <div className="form-group">
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea name="description" value={form.description} onChange={handleChange} />
      </div>
      <div className="form-group checkbox-group">
        <label>
          <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} />
          Active
        </label>
      </div>
      <button type="submit">{category?.id ? 'Save Changes' : 'Create Category'}</button>
    </form>
  );
}
