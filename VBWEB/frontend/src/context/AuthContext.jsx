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

// Provider component to wrap your app and share auth state
export const AuthProvider = ({ children }) => {
  // 'user' will hold user data and the JWT token when logged in, or null if not.
  const [user, setUser] = useState(null);

  // On mount, restore auth state from local storage if valid.
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
  }, [user]);

  const refreshAccessToken = async () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;
  
    const { refreshToken } = JSON.parse(storedUser);
  
    try {
      const response = await fetch('/api/refresh', {
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
      // Assume the API returns new access and refresh tokens
      const newUserData = {
        ...JSON.parse(storedUser), // Preserve any additional user info
        token: data.accessToken,
        refreshToken: data.refreshToken,
      };
  
      setUser(newUserData);
      localStorage.setItem('user', JSON.stringify(newUserData));
      
      return data.accessToken; // Optionally return the new token
    } catch (error) {
      console.error('Error refreshing token:', error);
      logout(); // Optionally log the user out if refresh fails
    }
  };
  

  // Call this on successful login. Expects userData to include a JWT token.
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Clear user state on logout.
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};


// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
