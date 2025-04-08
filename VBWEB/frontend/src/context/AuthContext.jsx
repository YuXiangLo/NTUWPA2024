// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import jwtDecode from '../utils/jwtHelper';

const AuthContext = createContext();

const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    return decoded.exp * 1000 < Date.now();
  } catch (error) {
    return true;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Restore auth state from localStorage on component mount.
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      if (parsedUser?.token && !isTokenExpired(parsedUser.token)) {
        setUser(parsedUser);
      } else {
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Refresh the access token using the refresh token.
  const refreshAccessToken = async () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;
    
    const { refreshToken } = JSON.parse(storedUser);
    try {
      const response = await fetch('/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      // Assume the API returns new access and refresh tokens.
      const newUserData = {
        ...JSON.parse(storedUser), // Retain additional user info if any.
        token: data.accessToken,
        refreshToken: data.refreshToken,
      };

      // Update the auth state and localStorage with new tokens.
      setUser(newUserData);
      localStorage.setItem('user', JSON.stringify(newUserData));

      return data.accessToken;
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout(); // Optionally log the user out if refreshing fails.
    }
  };

  // Scheduled token refresh: automatically triggers a refresh shortly before the token expires.
  useEffect(() => {
    if (!user || !user.token) return;

    const decoded = jwtDecode(user.token);
    const expiryTime = decoded.exp * 1000; // Convert expiration to milliseconds.
    const now = Date.now();
    // Set a safety margin of 60 seconds before expiry.
    const refreshMargin = 60 * 1000;
    const timeout = expiryTime - now - refreshMargin;

    let timerId;
    if (timeout > 0) {
      timerId = setTimeout(() => {
        refreshAccessToken();
      }, timeout);
    } else {
      // If the token is already near expiry, refresh immediately.
      refreshAccessToken();
    }

    // Clean up the scheduled refresh timer on unmount or when 'user' changes.
    return () => clearTimeout(timerId);
  }, [user]);

  // Call this function after a successful login. The userData object must include both tokens.
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Clear auth data on logout.
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshAccessToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access to the auth context.
export const useAuth = () => useContext(AuthContext);
