import { useEffect, useState, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

export default function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [notifications, setNotifications] = useState([]);
  const notificationsRef = useRef(null);
  const profileRef = useRef(null);

  const toggleSidebar = () => setCollapsed(!collapsed);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    triggerToast('Notifications cleared');
  };

  const formatNotificationTime = (date) => {
    try {
      const now = new Date();
      const diffMs = now - date;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins} mins ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays === 1) return 'Yesterday';
      return `${diffDays} days ago`;
    } catch (e) {
      return 'Recent';
    }
  };

  const [dateTime, setDateTime] = useState('');

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      setDateTime(now.toLocaleString(undefined, options));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    if (paths.length === 0) return ['Dashboard'];
    return paths.map(p => 
      p.split('-')
       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
       .join(' ')
    );
  };

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('it-asset-token');
        if (token) {
          api.defaults.headers.common.Authorization = `Bearer ${token}`;
        }
        
        const [assetsRes, maintRes] = await Promise.all([
          api.get('/assets'),
          api.get('/maintenance')
        ]);

        const assets = assetsRes.data.data || [];
        const maintenance = maintRes.data.data || [];
        const items = [];

        // 1. Asset Registrations
        assets.forEach(asset => {
          items.push({
            id: `reg-${asset.id}`,
            text: `${asset.name} was registered successfully.`,
            date: new Date(asset.created_at || asset.purchase_date || Date.now()),
            type: 'info'
          });

          // 2. Asset Assignments
          if (asset.status === 'Assigned' || asset.assigned_to) {
            items.push({
              id: `assign-${asset.id}`,
              text: `${asset.name} has been assigned to ${asset.assigned_username || 'a user'}.`,
              date: new Date(asset.updated_at || asset.purchase_date || Date.now()),
              type: 'info'
            });
          }
        });

        // 3. Maintenance Records
        maintenance.forEach(record => {
          const asset = assets.find(a => a.id === record.asset_id || a.asset_id === record.asset_id);
          const assetName = asset ? asset.name : (record.asset_id || 'Device');
          items.push({
            id: `maint-${record.id}`,
            text: `New maintenance logged for ${assetName}: ${record.maintenance_type || 'service'}.`,
            date: new Date(record.performed_at || record.created_at || Date.now()),
            type: 'alert'
          });
        });

        // Sort chronologically and take top 5
        const sortedNotifications = items
          .sort((a, b) => b.date - a.date)
          .slice(0, 5);

        setNotifications(sortedNotifications);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Collapsible Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <svg className="icon-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          {!collapsed && <h2>AssetSphere</h2>}
        </div>

        <nav className="sidebar-menu">
          <NavLink to="/" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
            <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="9" rx="1" />
              <rect x="14" y="3" width="7" height="5" rx="1" />
              <rect x="14" y="12" width="7" height="9" rx="1" />
              <rect x="3" y="16" width="7" height="5" rx="1" />
            </svg>
            {!collapsed && <span>Dashboard</span>}
          </NavLink>

          <NavLink to="/assets" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
            <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            {!collapsed && <span>Assets</span>}
          </NavLink>

          <NavLink to="/my-assets" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
            <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {!collapsed && <span>My Assets</span>}
          </NavLink>

          {user?.role === 'admin' && (
            <NavLink to="/categories" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
              <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="4" y1="9" x2="20" y2="9" />
                <line x1="4" y1="15" x2="20" y2="15" />
                <line x1="10" y1="3" x2="8" y2="21" />
                <line x1="16" y1="3" x2="14" y2="21" />
              </svg>
              {!collapsed && <span>Categories</span>}
            </NavLink>
          )}

          {['asset_manager', 'admin'].includes(user?.role) && (
            <NavLink to="/maintenance" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
              <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              {!collapsed && <span>Maintenance</span>}
            </NavLink>
          )}

          {user?.role === 'admin' && (
            <NavLink to="/settings" className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}>
              <svg className="menu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              {!collapsed && <span>Settings</span>}
            </NavLink>
          )}
        </nav>

        <div className="sidebar-footer">
          <button className="collapse-btn" onClick={toggleSidebar}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points={collapsed ? "9 18 15 12 9 6" : "15 18 9 12 15 6"} />
            </svg>
            {!collapsed && <span>Minimize Menu</span>}
          </button>
        </div>
      </aside>

      {/* Main Container Area */}
      <div className="main-content">
        {/* Sticky Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="breadcrumbs">
              {getBreadcrumbs().map((b, i) => (
                <span key={i} className="breadcrumb-item">
                  {b}
                  {i < getBreadcrumbs().length - 1 && <span className="breadcrumb-separator">/</span>}
                </span>
              ))}
            </div>
            {dateTime && (
              <div className="topbar-datetime">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: '14px', height: '14px', flexShrink: 0, color: 'var(--text-muted)' }}>
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                <span>{dateTime}</span>
              </div>
            )}
          </div>

          <div className="topbar-right">
            {/* Command Search box */}
            <div className="global-search-container" onClick={() => setSearchOpen(true)}>
              <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <span>Search platform...</span>
              <kbd className="search-kbd">⌘K</kbd>
            </div>

            {/* Light / Dark Mode Toggle */}
            <button className="topbar-icon-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
              {theme === 'dark' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>

            {/* Notification Center */}
            <div className="notification-wrapper" ref={notificationsRef}>
              <button className="topbar-icon-btn" onClick={() => { setShowNotifications(!showNotifications); setShowProfileMenu(false); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
                {notifications.length > 0 && <span className="notification-badge"></span>}
              </button>
              {showNotifications && (
                <div className="notification-dropdown dropdown-panel animate-slide-down">
                  <div className="dropdown-header">
                    <h4>Notifications</h4>
                    {notifications.length > 0 && (
                      <button className="btn-clear-all" onClick={handleClearNotifications}>Clear all</button>
                    )}
                  </div>
                  <div className="dropdown-body">
                    {notifications.length === 0 ? (
                      <p className="notifications-empty" style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        No new notifications
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div key={n.id} className="notification-item">
                          <div className="item-bullet"></div>
                          <div className="item-content">
                            <p>{n.text}</p>
                            <span>{formatNotificationTime(n.date)}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="profile-wrapper" ref={profileRef}>
              <button className="profile-trigger" onClick={() => { setShowProfileMenu(!showProfileMenu); setShowNotifications(false); }}>
                <div className="avatar">
                  {user?.username?.slice(0, 2).toUpperCase() || 'US'}
                </div>
              </button>
              {showProfileMenu && (
                <div className="profile-dropdown dropdown-panel animate-slide-down">
                  <div className="profile-header">
                    <p className="profile-name">{user?.username || 'User account'}</p>
                    <p className="profile-role">{user?.role?.replace('_', ' ') || 'Guest User'}</p>
                  </div>
                  <div className="profile-body">
                    <button className="dropdown-link logout-link" onClick={logout}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Core Layout Outlet */}
        <main className="content-container animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* Ctrl + K Command Palette Dialog */}
      {searchOpen && (
        <div className="modal-overlay" onClick={() => setSearchOpen(false)}>
          <div className="modal-content search-modal animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search resources, actions, or assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <kbd className="modal-close-kbd">ESC</kbd>
            </div>
            <div className="search-modal-body">
              <p className="section-title">Quick Navigation</p>
              <div className="navigation-suggestions">
                <NavLink to="/" onClick={() => setSearchOpen(false)} className="suggestion-item">
                  <span>Go to Dashboard</span>
                  <kbd>↵</kbd>
                </NavLink>
                <NavLink to="/assets" onClick={() => setSearchOpen(false)} className="suggestion-item">
                  <span>View All Assets</span>
                  <kbd>↵</kbd>
                </NavLink>
                <NavLink to="/my-assets" onClick={() => setSearchOpen(false)} className="suggestion-item">
                  <span>View Assigned Assets</span>
                  <kbd>↵</kbd>
                </NavLink>
                {user?.role === 'admin' && (
                  <NavLink to="/categories" onClick={() => setSearchOpen(false)} className="suggestion-item">
                    <span>Manage Categories</span>
                    <kbd>↵</kbd>
                  </NavLink>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button / Quick Note */}
      <button className="fab" onClick={() => triggerToast('System status: Active & Secured via SAP BTP XSUAA')} aria-label="Quick Status Check">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      </button>

      {/* Global Toast */}
      {toastMessage && (
        <div className="toast-notification animate-slide-in">
          <div className="toast-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>
          <div className="toast-text">{toastMessage}</div>
        </div>
      )}
    </div>
  );
}
