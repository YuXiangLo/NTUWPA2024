// src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import jwtDecode from '../utils/jwtHelper';

// Create the context
const AuthContext = createContext();

// Helper function to check if the token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = jwtDecode(token);
    // JWT 'exp' is in seconds; convert to milliseconds.
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
