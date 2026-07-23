import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid username or password credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/register', { username, email, password, role });
      setError('');
      setIsRegistering(false);
      setEmail('');
      setPassword('');
      setUsername('');
      alert('Registration successful! You can now log in.');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Email or username might be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`auth-container ${isRegistering ? 'register-mode' : 'login-mode'}`}>
      <div className="auth-wrapper">
        
        {/* Banner Welcome Panel */}
        <div className="auth-banner-panel">
          <div className="auth-banner-content">
            <div className="banner-welcome-group">
              <span className="banner-welcome-label">Welcome to</span>
              <div className="branding-title-row">
                <svg className="branding-icon-colored" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <h1 className="banner-title">AssetSphere</h1>
              </div>
            </div>
            
            <p className="banner-description">
              Start tracking and managing assets smarter. Build your inventory, manage categories, assign hardware/software, and keep your workspace secure. All from one powerful IT management console.
            </p>
            
            <div className="banner-features">
              <div className="feature-item">
                <span className="feature-icon">💻</span>
                <span>Track Anywhere</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">📈</span>
                <span>Scale Faster</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔑</span>
                <span>Secure Access</span>
              </div>
            </div>
          </div>

          {/* Floating background shapes/icons for aesthetic */}
          <div className="floating-icons">
            <div className="floating-icon icon-1">💻</div>
            <div className="floating-icon icon-2">🔒</div>
            <div className="floating-icon icon-3">📦</div>
            <div className="floating-icon icon-4">📊</div>
          </div>
        </div>

        {/* Form Card Panel */}
        <div className="auth-form-panel">
          <div className="auth-form-card animate-fade-in">
            <div className="auth-form-header">
              <h2>{isRegistering ? 'Create your account' : 'Sign in to your account'}</h2>
              <p className="subtitle-text">
                {isRegistering ? (
                  <>
                    Already have an account?{' '}
                    <span className="auth-toggle-link" onClick={() => { setIsRegistering(false); setError(''); }}>
                      Login
                    </span>
                  </>
                ) : (
                  <>
                    Don't have an account?{' '}
                    <span className="auth-toggle-link" onClick={() => { setIsRegistering(true); setError(''); }}>
                      Register
                    </span>
                  </>
                )}
              </p>
            </div>

            {error && <div className="form-error">{error}</div>}

            <form onSubmit={isRegistering ? handleRegister : handleSubmit} className="auth-form">
              <div className="form-group">
                <label>User Name</label>
                <input 
                  type="text"
                  placeholder="Enter your username"
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                  disabled={loading}
                />
              </div>
              
              {isRegistering && (
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                    disabled={loading}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  placeholder="Enter your password"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  disabled={loading}
                />
              </div>

              {isRegistering && (
                <div className="form-group">
                  <label>Register As</label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)} 
                    disabled={loading}
                    className="auth-select"
                  >
                    <option value="user">User</option>
                    <option value="asset_manager">Asset Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}

              <button type="submit" className="primary submit-btn-gradient" disabled={loading}>
                {loading ? (
                  <span className="spinner"></span>
                ) : isRegistering ? (
                  'Create account'
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {!isRegistering && (
              <>
                <div className="auth-forgot-password">
                  <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Demo Mode: Use pre-seeded credentials to sign in.'); }} className="forgot-link">
                    Forgot password?
                  </a>
                </div>
                <div className="auth-note">
                  <h5>Demo Credentials (Mock Mode)</h5>
                  <div className="credentials-row">
                    <p><strong>admin</strong> / <code>Admin123!</code></p>
                    <p><strong>manager</strong> / <code>Manager123!</code></p>
                    <p><strong>user</strong> / <code>User123!</code></p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
