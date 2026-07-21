import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <nav className="navbar">
        <div className="branding">
          <strong>IT Asset Tracker</strong>
          <span className="subtitle">Secure asset management for the whole team</span>
        </div>
        <div className="nav-links">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/assets">Assets</NavLink>
          <NavLink to="/my-assets">My Assets</NavLink>
          {user?.role === 'admin' ? <NavLink to="/categories">Categories</NavLink> : null}
          {['asset_manager', 'admin'].includes(user?.role) ? <NavLink to="/maintenance">Maintenance</NavLink> : null}
          <span className="role-badge">{user?.role?.replace('_', ' ') || 'Guest'}</span>
          <button className="secondary logout-button" onClick={logout}>Logout</button>
        </div>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
