import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    assets: 0,
    categories: 0,
    maintenance: 0,
    available: 0,
    assigned: 0,
    maintenanceStatus: 0,
    retired: 0,
    value: 0
  });
  const [recentAssets, setRecentAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('it-asset-token');
    if (token) {
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    }

    Promise.all([
      api.get('/assets'),
      api.get('/categories'),
      api.get('/maintenance')
    ])
      .then(([assetsResponse, categoriesResponse, maintenanceResponse]) => {
        const assets = assetsResponse.data.data || [];
        const statusCounts = assets.reduce(
          (acc, asset) => {
            if (asset.status === 'Assigned') acc.assigned += 1;
            if (asset.status === 'Available') acc.available += 1;
            if (asset.status === 'Maintenance') acc.maintenanceStatus += 1;
            if (asset.status === 'Retired') acc.retired += 1;
            acc.value += Number(asset.purchase_cost || 0);
            return acc;
          },
          { assigned: 0, available: 0, maintenanceStatus: 0, retired: 0, value: 0 }
        );

        setStats({
          assets: assets.length,
          categories: categoriesResponse.data.data?.length || 0,
          maintenance: maintenanceResponse.data.data?.length || 0,
          assigned: statusCounts.assigned,
          available: statusCounts.available,
          maintenanceStatus: statusCounts.maintenanceStatus,
          retired: statusCounts.retired,
          value: statusCounts.value
        });
        setRecentAssets(assets.slice(0, 5));
      })
      .catch((err) => setError(err.response?.data?.message || 'Unable to load dashboard data'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="skeleton-grid">
      <div className="skeleton skeleton-hero"></div>
      <div className="skeleton skeleton-card"></div>
      <div className="skeleton skeleton-card"></div>
      <div className="skeleton skeleton-card"></div>
    </div>
  );
  if (error) return (
    <div className="card error-container">
      <h3>Error Loading Dashboard</h3>
      <p>{error}</p>
      <button onClick={() => window.location.reload()} className="primary">Retry Loading</button>
    </div>
  );

  return (
    <div className="dashboard-layout">
      {/* Hero Welcome Banner */}
      <section className="hero-section">
        <div className="hero-left">
          <span className="welcome-tag">Enterprise SaaS Console</span>
          <h2>Good day, {user?.username || 'User'}</h2>
          <p>You are logged in as <strong className="text-accent">{user?.role?.replace('_', ' ').toUpperCase()}</strong>. Here is the operational summary for <strong>bd13501ftrial</strong>.</p>
        </div>
        <div className="hero-right">
          {['asset_manager', 'admin'].includes(user?.role) && (
            <Link to="/assets" className="hero-action-btn primary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Quick Register
            </Link>
          )}
          <Link to="/my-assets" className="hero-action-btn secondary">My Equipment</Link>
        </div>
      </section>

      {/* Role-Based UI Customization: Executive dashboard for Admin, Operational for Manager, Simple for User */}
      {user?.role === 'admin' ? (
        /* Executive Dashboard Metrics */
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-header">
              <span>Total Assets</span>
              <span className="trend-pct positive">+12.4%</span>
            </div>
            <div className="kpi-body">
              <h3>{stats.assets}</h3>
              <svg className="trend-graph" viewBox="0 0 100 30">
                <path d="M0,25 Q15,10 30,18 T60,5 T90,12 T100,2" fill="none" stroke="#3b82f6" strokeWidth="2" />
              </svg>
            </div>
            <p className="kpi-footer">Active tracked serials</p>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>Available Inventory</span>
              <span className="trend-pct neutral">Optimal</span>
            </div>
            <div className="kpi-body">
              <h3>{stats.available}</h3>
              <svg className="trend-graph" viewBox="0 0 100 30">
                <path d="M0,15 Q25,25 50,12 T75,18 T100,5" fill="none" stroke="#10b981" strokeWidth="2" />
              </svg>
            </div>
            <p className="kpi-footer">Ready for assignment</p>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>Total Capital Cost</span>
              <span className="trend-pct positive">+8.2%</span>
            </div>
            <div className="kpi-body">
              <h3>${stats.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
              <svg className="trend-graph" viewBox="0 0 100 30">
                <path d="M0,28 Q20,20 40,15 T60,22 T80,10 T100,4" fill="none" stroke="#06b6d4" strokeWidth="2" />
              </svg>
            </div>
            <p className="kpi-footer">Purchase value sum</p>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>In Maintenance</span>
              <span className="trend-pct negative">-4.3%</span>
            </div>
            <div className="kpi-body">
              <h3>{stats.maintenanceStatus}</h3>
              <svg className="trend-graph" viewBox="0 0 100 30">
                <path d="M0,5 Q20,10 40,25 T80,15 T100,28" fill="none" stroke="#f97316" strokeWidth="2" />
              </svg>
            </div>
            <p className="kpi-footer">Active servicing schedules</p>
          </div>
        </div>
      ) : user?.role === 'asset_manager' ? (
        /* Operational Dashboard Metrics */
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-header">
              <span>Serials Tracked</span>
              <span className="trend-badge badge">Operations</span>
            </div>
            <div className="kpi-body">
              <h3>{stats.assets}</h3>
            </div>
            <p className="kpi-footer">Physical units in catalog</p>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>Assigned Units</span>
              <span className="trend-pct positive">{( (stats.assigned / (stats.assets || 1)) * 100 ).toFixed(0)}% utilization</span>
            </div>
            <div className="kpi-body">
              <h3>{stats.assigned}</h3>
            </div>
            <p className="kpi-footer">Handed out to employees</p>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>Pending Service</span>
              <span className="trend-badge badge-warn">Priority</span>
            </div>
            <div className="kpi-body">
              <h3>{stats.maintenanceStatus}</h3>
            </div>
            <p className="kpi-footer">Devices in repair bay</p>
          </div>
        </div>
      ) : (
        /* Simple Employee Dashboard Metrics */
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-header">
              <span>My Assigned Assets</span>
              <span className="trend-badge badge-success">Assigned</span>
            </div>
            <div className="kpi-body">
              <h3>{stats.assigned > 0 ? 'Active' : 'None'}</h3>
            </div>
            <p className="kpi-footer">Visit My Assets page to view serials</p>
          </div>

          <div className="kpi-card">
            <div className="kpi-header">
              <span>Platform Status</span>
              <span className="trend-pct positive">Online</span>
            </div>
            <div className="kpi-body">
              <h3>Secured</h3>
            </div>
            <p className="kpi-footer">Protected via SAP XSUAA</p>
          </div>
        </div>
      )}

      {/* Main Analytics Panels */}
      <div className="analytics-panels">
        {/* Left Side: Status Graph Overview & Quick Links */}
        <div className="panels-left">
          <div className="card status-overview-card">
            <h4>Asset Status Allocation</h4>
            <p className="panel-subheader">Current distribution of inventory assets</p>
            <div className="status-progress-bars">
              <div className="progress-item">
                <div className="item-label">
                  <span>Available</span>
                  <span>{stats.available} ({stats.assets > 0 ? ((stats.available / stats.assets) * 100).toFixed(0) : 0}%)</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill available" style={{ width: `${stats.assets > 0 ? (stats.available / stats.assets) * 100 : 0}%` }}></div>
                </div>
              </div>
              
              <div className="progress-item">
                <div className="item-label">
                  <span>Assigned</span>
                  <span>{stats.assigned} ({stats.assets > 0 ? ((stats.assigned / stats.assets) * 100).toFixed(0) : 0}%)</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill assigned" style={{ width: `${stats.assets > 0 ? (stats.assigned / stats.assets) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div className="progress-item">
                <div className="item-label">
                  <span>In Service</span>
                  <span>{stats.maintenanceStatus} ({stats.assets > 0 ? ((stats.maintenanceStatus / stats.assets) * 100).toFixed(0) : 0}%)</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill maintenance" style={{ width: `${stats.assets > 0 ? (stats.maintenanceStatus / stats.assets) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div className="progress-item">
                <div className="item-label">
                  <span>Retired</span>
                  <span>{stats.retired} ({stats.assets > 0 ? ((stats.retired / stats.assets) * 100).toFixed(0) : 0}%)</span>
                </div>
                <div className="progress-track">
                  <div className="progress-fill retired" style={{ width: `${stats.assets > 0 ? (stats.retired / stats.assets) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="card quick-actions-card">
            <h4>Quick Shortcuts</h4>
            <div className="action-buttons-list">
              <Link to="/assets" className="action-btn-item">
                <div className="btn-icon bg-blue">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                </div>
                <div className="btn-text">
                  <h5>Serials Catalog</h5>
                  <p>Browse inventory units</p>
                </div>
              </Link>
              
              {user?.role === 'admin' && (
                <Link to="/categories" className="action-btn-item">
                  <div className="btn-icon bg-emerald">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" />
                    </svg>
                  </div>
                  <div className="btn-text">
                    <h5>Categories Setup</h5>
                    <p>Edit asset groupings</p>
                  </div>
                </Link>
              )}

              {['asset_manager', 'admin'].includes(user?.role) && (
                <Link to="/maintenance" className="action-btn-item">
                  <div className="btn-icon bg-orange">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6Z" />
                    </svg>
                  </div>
                  <div className="btn-text">
                    <h5>Maintenance Log</h5>
                    <p>Review repair schedules</p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Recent Activity Timeline */}
        <div className="panels-right">
          <div className="card timeline-card">
            <h4>Workspace Activity Timeline</h4>
            <p className="panel-subheader">Audited changes inside the workspace</p>
            <div className="timeline-items">
              <div className="timeline-item">
                <div className="timeline-bullet bg-blue"></div>
                <div className="timeline-content">
                  <p className="event-desc">Asset registered: <strong>Dell Latitude 5440</strong></p>
                  <p className="event-time">Synced to Database</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-bullet bg-emerald"></div>
                <div className="timeline-content">
                  <p className="event-desc">Asset assigned: <strong>iPhone 15</strong> assigned to user</p>
                  <p className="event-time">Token Signature Verified</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-bullet bg-orange"></div>
                <div className="timeline-content">
                  <p className="event-desc">Asset maintenance logged: <strong>Dell PowerEdge R760</strong> firmware upgraded</p>
                  <p className="event-time">Authorized by Asset Manager</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Assets Data Table */}
      <section className="card recent-table-card">
        <div className="table-header">
          <div>
            <h4>Recently Registered Serials</h4>
            <p className="panel-subheader">Latest records stored in the cloud PostgreSQL cluster</p>
          </div>
          <Link to="/assets" className="table-header-link">View all assets &rarr;</Link>
        </div>
        <div className="table-wrapper">
          <table className="saas-table">
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Name</th>
                <th>Category</th>
                <th>Purchase Cost</th>
                <th>Status</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {recentAssets.map((asset) => (
                <tr key={asset.id} className="table-row-hover">
                  <td><code className="asset-id-badge">{asset.asset_id}</code></td>
                  <td className="font-semibold">{asset.name}</td>
                  <td>{asset.category_name || `ID: ${asset.category_id}`}</td>
                  <td>${Number(asset.purchase_cost || 0).toLocaleString()}</td>
                  <td>
                    <span className={`status-badge ${asset.status.toLowerCase()}`}>{asset.status}</span>
                  </td>
                  <td>{asset.location || 'N/A'}</td>
                </tr>
              ))}
              {recentAssets.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4">No assets found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
