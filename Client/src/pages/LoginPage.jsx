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
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    try {
      await api.post('/auth/register', { username, email, password, role: 'user' });
      setError('');
      setIsRegistering(false);
      setEmail('');
      setPassword('');
      setUsername('');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-card">
      <div className="auth-header">
        <h2>{isRegistering ? 'Create an account' : 'Welcome back'}</h2>
        <p>{isRegistering ? 'Register to join the IT Asset Tracker' : 'Sign in to view and manage your assigned equipment'}</p>
      </div>
      <form onSubmit={isRegistering ? handleRegister : handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        {isRegistering ? (
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        ) : null}
        <div className="form-group">
          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {error ? <p className="form-error">{error}</p> : null}
        <button type="submit">{isRegistering ? 'Create account' : 'Login'}</button>
      </form>
      {!isRegistering ? (
        <div className="auth-note">
          <p>Demo sign-in: <strong>admin / admin123</strong> or <strong>manager / manager123</strong> or <strong>user / user123</strong>.</p>
        </div>
      ) : null}
      <p>
        <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="secondary">
          {isRegistering ? 'Back to login' : 'Need an account? Sign up'}
        </button>
      </p>
    </div>
  );
}
