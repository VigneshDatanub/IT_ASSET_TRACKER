import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api'
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('it-asset-token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    api.get('/auth/me')
      .then((response) => setUser(response.data.data))
      .catch(() => {
        localStorage.removeItem('it-asset-token');
        setToken(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    const authToken = response.data.data.token;
    const authUser = response.data.data.user;
    localStorage.setItem('it-asset-token', authToken);
    api.defaults.headers.common.Authorization = `Bearer ${authToken}`;
    setToken(authToken);
    setUser(authUser);
    return authUser;
  };

  const logout = () => {
    localStorage.removeItem('it-asset-token');
    delete api.defaults.headers.common.Authorization;
    setToken(null);
    setUser(null);
  };

  const value = useMemo(() => ({ user, token, loading, login, logout }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
