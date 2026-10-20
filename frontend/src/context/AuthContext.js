import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

/**
 * Checks whether a JWT token string is expired by decoding the `exp` claim.
 * Does NOT verify the signature — that is done server-side.
 * Returns true if the token is missing, malformed, or past its expiry time.
 */
function isTokenExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!payload.exp) return false;
    // exp is in seconds; Date.now() is in milliseconds
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    authService.logout();
    setUser(null);
    navigate('/login');
  }, [navigate]);

  useEffect(() => {
    // On mount: validate the stored token before trusting it
    const token = localStorage.getItem('access_token');
    if (isTokenExpired(token)) {
      // Clear stale/expired session silently
      authService.logout();
      setUser(null);
    } else {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Listen for the custom event emitted by the Axios 401 interceptor.
    // This lets us update React state cleanly instead of forcing a hard page reload.
    window.addEventListener('auth:logout', handleLogout);
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [handleLogout]);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data;
  };

  const logout = useCallback(() => {
    handleLogout();
  }, [handleLogout]);

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
