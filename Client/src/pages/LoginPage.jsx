import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
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
      await api.post('/auth/register', { username, email, password, role: 'user' });
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
    <div className="auth-container">
      <div className="auth-card animate-fade-in">
        {/* Branding Header */}
        <div className="auth-branding">
          <svg className="branding-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <h1>AssetSphere</h1>
          <p className="branding-tag">Enterprise IT Asset Intelligence</p>
        </div>

        <div className="auth-header">
          <h2>{isRegistering ? 'Create your console account' : 'Welcome back'}</h2>
          <p className="subtitle-text">
            {isRegistering 
              ? 'Register to start tracking and assigning resources' 
              : 'Enter your credentials to manage your workspace'}
          </p>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={isRegistering ? handleRegister : handleSubmit} className="auth-form">
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text"
              placeholder="e.g. admin, manager, user"
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              disabled={loading}
            />
          </div>
          
          {isRegistering && (
            <div className="form-group">
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="e.g. mail@example.com"
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
              placeholder="••••••••"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              disabled={loading}
            />
          </div>

          <button type="submit" className="primary submit-btn" disabled={loading}>
            {loading ? (
              <span className="spinner"></span>
            ) : isRegistering ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {!isRegistering && (
          <div className="auth-note">
            <h5>Demo Credentials (Mock Mode)</h5>
            <div className="credentials-row">
              <p><strong>admin</strong> / <code>Admin123!</code></p>
              <p><strong>manager</strong> / <code>Manager123!</code></p>
              <p><strong>user</strong> / <code>User123!</code></p>
            </div>
          </div>
        )}

        <div className="auth-footer">
          <button 
            type="button" 
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }} 
            className="secondary-toggle-btn"
            disabled={loading}
          >
            {isRegistering ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
}
