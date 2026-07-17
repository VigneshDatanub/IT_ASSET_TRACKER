import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <nav className="navbar">
        <strong>IT Asset Tracker</strong>
        <div className="nav-links">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/assets">Assets</NavLink>
          <NavLink to="/my-assets">My Assets</NavLink>
          {user?.role === 'admin' ? <NavLink to="/categories">Categories</NavLink> : null}
          {['asset_manager', 'admin'].includes(user?.role) ? <NavLink to="/maintenance">Maintenance</NavLink> : null}
          <span>{user?.role}</span>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
}
