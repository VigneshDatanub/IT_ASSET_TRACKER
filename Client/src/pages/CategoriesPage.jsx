import { useEffect, useState } from 'react';
import axios from 'axios';
import CategoryForm from '../components/CategoryForm';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);

  const loadCategories = () => {
    const token = localStorage.getItem('it-asset-token');
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }

    setLoading(true);
    api.get('/categories')
      .then((response) => setCategories(response.data.data || []))
      .catch((err) => setError(err.response?.data?.message || 'Unable to load categories'))
      .finally(() => setLoading(false));
  };

  const handleDelete = async (categoryId) => {
    try {
      await api.delete(`/categories/${categoryId}`);
      loadCategories();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete category');
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  if (loading) return <div className="card">Loading categories...</div>;
  if (error) return <div className="card">{error}</div>;

  return (
    <div>
      <div className="card">
        <h2>Categories</h2>
        <div className="grid">
          {categories.map((category) => (
            <div key={category.id} className="card">
              <strong>{category.name}</strong>
              <p>{category.description || 'No description provided.'}</p>
              <div className="button-row">
                <button type="button" onClick={() => setEditingCategory(category)}>Edit</button>
                <button type="button" onClick={() => handleDelete(category.id)} className="secondary">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <CategoryForm
        category={editingCategory}
        onSaved={() => {
          loadCategories();
          setEditingCategory(null);
        }}
      />
    </div>
  );
}
