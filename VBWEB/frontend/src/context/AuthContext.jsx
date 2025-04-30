import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from 'react';
import jwtDecode from '../utils/jwtHelper';
import { API_DOMAIN } from '../config.js';

const AuthContext = createContext();

// Check if JWT accessToken is expired
const isTokenExpired = (token) => {
  try {
    const { exp } = jwtDecode(token);
    return exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  // Load user (with accessToken + refreshToken) from localStorage
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored user:', e);
      }
    }
    return null;
  });
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const isRefreshing = useRef(false);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  // Refresh accessToken and refreshToken
  const refreshAccessToken = useCallback(async () => {
    if (isRefreshing.current || !user?.refreshToken) return null;
    isRefreshing.current = true;
    try {
      const response = await fetch(`${API_DOMAIN}/auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: user.refreshToken }),
      });
      if (!response.ok) throw new Error('Failed to refresh token');

      const { accessToken, refreshToken } = await response.json();
      setUser(prev => {
        const updated = { ...prev, accessToken, refreshToken };
        localStorage.setItem('user', JSON.stringify(updated));
        return updated;
      });
      return accessToken;
    } catch (err) {
      console.error('Refresh token error:', err);
      logout();
    } finally {
      isRefreshing.current = false;
    }
  }, [user?.refreshToken, logout]);

  // Initial auth check with timeout fallback
  useEffect(() => {
    let timedOut = false;
    const timeoutId = setTimeout(() => {
      timedOut = true;
      console.warn('Auth check timeout, proceeding to load app');
      setIsAuthLoaded(true);
    }, 5000);

    const check = async () => {
      if (user?.accessToken && isTokenExpired(user.accessToken)) {
        await refreshAccessToken();
      }
      if (!timedOut) {
        clearTimeout(timeoutId);
        setIsAuthLoaded(true);
      }
    };
    check();
  }, [refreshAccessToken, user?.accessToken]);

  // Poll every minute to refresh ahead of expiry
  useEffect(() => {
    if (!user?.accessToken) return;
    const intervalId = setInterval(() => {
      if (isTokenExpired(user.accessToken)) {
        refreshAccessToken();
      }
    }, 60 * 1000);
    return () => clearInterval(intervalId);
  }, [user?.accessToken, refreshAccessToken]);

  // Login stores both tokens
  const login = useCallback((userData) => {
    const normalized = {
      ...userData,
      accessToken: userData.accessToken,
      refreshToken: userData.refreshToken,
    };
    setUser(normalized);
    localStorage.setItem('user', JSON.stringify(normalized));
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthLoaded }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

