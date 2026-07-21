import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import AssetForm from '../components/AssetForm';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

export default function AssetsPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingAsset, setEditingAsset] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal states
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignUserId, setAssignUserId] = useState('');
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [mType, setMType] = useState('');
  const [mDesc, setMDesc] = useState('');
  const [modalError, setModalError] = useState('');

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

  const loadUsers = () => {
    if (['asset_manager', 'admin'].includes(user?.role)) {
      const token = localStorage.getItem('it-asset-token');
      if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
      }
      api.get('/auth/users')
        .then((response) => setUsers(response.data.data || []))
        .catch((err) => console.error('Failed to load users', err));
    }
  };

  const handleDelete = async (assetId) => {
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    try {
      await api.delete(`/assets/${assetId}`);
      loadAssets();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete asset');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignUserId) {
      setModalError('Please select a user');
      return;
    }
    setModalError('');
    try {
      await api.post(`/assets/${selectedAsset.id}/assign`, { user_id: Number(assignUserId) });
      setShowAssignModal(false);
      setSelectedAsset(null);
      setAssignUserId('');
      loadAssets();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to assign asset');
    }
  };

  const handleUnassign = async (asset) => {
    if (!window.confirm(`Are you sure you want to unassign ${asset.name}?`)) return;
    try {
      const token = localStorage.getItem('it-asset-token');
      if (token) {
        api.defaults.headers.common.Authorization = `Bearer ${token}`;
      }
      await api.put(`/assets/${asset.id}`, { assigned_to: null, status: 'Available' });
      loadAssets();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to unassign asset');
    }
  };

  const handleMaintenance = async (e) => {
    e.preventDefault();
    if (!mType || !mDesc) {
      setModalError('Please fill out all fields');
      return;
    }
    setModalError('');
    try {
      await api.post('/maintenance', {
        asset_id: selectedAsset.id,
        maintenance_type: mType,
        description: mDesc
      });
      setShowMaintenanceModal(false);
      setSelectedAsset(null);
      setMType('');
      setMDesc('');
      loadAssets();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to log maintenance');
    }
  };

  useEffect(() => {
    loadAssets();
    loadUsers();
  }, [user]);

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch = [asset.asset_id, asset.name, asset.description, asset.location]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === 'all' || asset.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [assets, search, statusFilter]);

  if (loading) return <div className="card">Loading assets...</div>;
  if (error) return <div className="card">{error}</div>;

  return (
    <div>
      <div className="top-panel">
        <div>
          <h2>Assets</h2>
          <p>Browse all tracked assets and manage them according to your role.</p>
        </div>
        {['asset_manager', 'admin'].includes(user?.role) ? (
          <span className="badge">Manager tools enabled</span>
        ) : (
          <span className="badge muted">Read-only access</span>
        )}
      </div>

      <div className="filter-panel card">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search assets by ID, name, or location"
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All statuses</option>
          <option value="Available">Available</option>
          <option value="Assigned">Assigned</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Retired">Retired</option>
        </select>
      </div>

      {filteredAssets.length === 0 ? (
        <div className="card">No assets match your search.</div>
      ) : (
        <div className="grid">
          {filteredAssets.map((asset) => (
            <div key={asset.id} className="card asset-card">
              <div className="card-header">
                <div>
                  <p className="asset-id">{asset.asset_id}</p>
                  <h3>{asset.name}</h3>
                </div>
                <span className={`status-badge ${asset.status.toLowerCase()}`}>{asset.status}</span>
              </div>
              <p className="card-description">{asset.description || 'No description provided.'}</p>
              
              <div className="card-details">
                <p><strong>Category</strong> <span>{asset.category_name || `ID: ${asset.category_id}`}</span></p>
                <p><strong>Assigned to</strong> <span>{asset.assigned_username || 'Unassigned'}</span></p>
                <p><strong>Location</strong> <span>{asset.location || 'N/A'}</span></p>
                <p><strong>Cost</strong> <span>${Number(asset.purchase_cost || 0).toLocaleString()}</span></p>
              </div>

              <div className="button-row">
                {['asset_manager', 'admin'].includes(user?.role) ? (
                  <>
                    <button type="button" className="secondary" onClick={() => setEditingAsset(asset)}>Edit</button>
                    {asset.status === 'Available' && (
                      <button type="button" className="primary" onClick={() => {
                        setSelectedAsset(asset);
                        setShowAssignModal(true);
                      }}>Assign</button>
                    )}
                    {asset.status === 'Assigned' && (
                      <button type="button" className="danger" onClick={() => handleUnassign(asset)}>Unassign</button>
                    )}
                    {asset.status !== 'Retired' && asset.status !== 'Maintenance' && (
                      <button type="button" className="secondary" onClick={() => {
                        setSelectedAsset(asset);
                        setShowMaintenanceModal(true);
                      }}>Service</button>
                    )}
                    <button type="button" onClick={() => handleDelete(asset.id)} className="danger">Delete</button>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      {['asset_manager', 'admin'].includes(user?.role) && editingAsset ? (
        <AssetForm
          asset={editingAsset}
          onSaved={() => {
            loadAssets();
            setEditingAsset(null);
          }}
        />
      ) : null}

      {/* Assign Asset Modal */}
      {showAssignModal && selectedAsset && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Assign Asset</h3>
              <button className="modal-close" onClick={() => {
                setShowAssignModal(false);
                setSelectedAsset(null);
                setModalError('');
              }}>&times;</button>
            </div>
            <form onSubmit={handleAssign}>
              {modalError && <p className="form-error">{modalError}</p>}
              <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                Assigning <strong>{selectedAsset.name}</strong> ({selectedAsset.asset_id})
              </p>
              <div className="form-group">
                <label>Select User</label>
                <select value={assignUserId} onChange={(e) => setAssignUserId(e.target.value)} required>
                  <option value="">Select a team member...</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.username} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div className="button-row" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="secondary" onClick={() => {
                  setShowAssignModal(false);
                  setSelectedAsset(null);
                  setModalError('');
                }}>Cancel</button>
                <button type="submit" className="primary">Confirm Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Service / Maintenance Modal */}
      {showMaintenanceModal && selectedAsset && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Log Maintenance</h3>
              <button className="modal-close" onClick={() => {
                setShowMaintenanceModal(false);
                setSelectedAsset(null);
                setModalError('');
              }}>&times;</button>
            </div>
            <form onSubmit={handleMaintenance}>
              {modalError && <p className="form-error">{modalError}</p>}
              <p style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
                Log service details for <strong>{selectedAsset.name}</strong>.
              </p>
              <div className="form-group">
                <label>Service Type</label>
                <input
                  type="text"
                  placeholder="e.g. Screen Replacement, OS Upgrade"
                  value={mType}
                  onChange={(e) => setMType(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Details of the work performed or issue detected..."
                  rows={4}
                  value={mDesc}
                  onChange={(e) => setMDesc(e.target.value)}
                  required
                />
              </div>
              <div className="button-row" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="secondary" onClick={() => {
                  setShowMaintenanceModal(false);
                  setSelectedAsset(null);
                  setModalError('');
                }}>Cancel</button>
                <button type="submit" className="primary">Log & Put in Service</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
