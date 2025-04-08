// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import jwtDecode from '../utils/jwtHelper';
import { API_DOMAIN } from '../config.js';

const AuthContext = createContext();

// Helper: Check if token is expired (expecting JWT 'exp' in seconds)
const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error decoding token:', error);
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  // Lazy initializer: read stored user even if the token is expired.
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('Restoring user from localStorage:', parsedUser);
        return parsedUser;
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
    return null;
  });

  // Flag to indicate that auth has been checked (i.e. refresh attempted if needed)
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);

  // Function to refresh the access token using the refresh token.
  const refreshAccessToken = async () => {
    if (!user || !user.refreshToken) {
      console.warn('No refresh token available');
      return;
    }
    try {
      const response = await fetch(`${API_DOMAIN}auth/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: user.refreshToken }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      // Assume API returns { accessToken, refreshToken }
      const newUserData = {
        ...user, // retain any additional user info
        token: data.accessToken,
        refreshToken: data.refreshToken,
      };

      setUser(newUserData);
      localStorage.setItem('user', JSON.stringify(newUserData));
      console.log('Token refreshed successfully:', newUserData);
      return data.accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Clear the user state if refresh fails
      logout();
    }
  };

  // On mount, if a user exists and the token is expired, try to refresh the token.
  useEffect(() => {
    const checkAuth = async () => {
      if (user) {
        if (isTokenExpired(user.token)) {
          console.log('Stored token expired, attempting refresh...');
          await refreshAccessToken();
        }
      }
      // Mark that auth check is complete so the rest of the app can render.
      setIsAuthLoaded(true);
    };
    checkAuth();
    // We only want this check to run on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scheduled token refresh: if token is valid, schedule a refresh ahead of expiration.
  useEffect(() => {
    if (!user || !user.token) return;

    const decoded = jwtDecode(user.token);
    const expiryTime = decoded.exp * 1000;
    const now = Date.now();
    const refreshMargin = 60 * 1000; // refresh 1 minute before expiry
    const timeout = expiryTime - now - refreshMargin;

    console.log(`Token expires in ${expiryTime - now}ms. Scheduling refresh in ${timeout}ms.`);
    let timerId;
    if (timeout > 0) {
      timerId = setTimeout(() => {
        refreshAccessToken();
      }, timeout);
    } else {
      // If token is near or past expiration, attempt to refresh immediately.
      refreshAccessToken();
    }
    return () => clearTimeout(timerId);
  }, [user]);

  // Function to handle login: store user data (including tokens)
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    console.log('User logged in:', userData);
  };

  // Function to handle logout: clear state and local storage.
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    console.log('User logged out');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthLoaded }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
