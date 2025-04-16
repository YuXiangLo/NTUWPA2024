// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_DOMAIN } from '../config.js';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Get the redirect path from query parameters (if any)
  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (email && password) {
      try {
        const response = await fetch(`${API_DOMAIN}auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Logged in:', data);
          login(data);
          // Navigate back to the redirect URL after successful login
          navigate(redirect, { replace: true });
        } else {
          const errorData = await response.json();
          setErrorMsg(errorData.message || 'Login failed');
        }
      } catch (error) {
        console.error('Error during login:', error);
        setErrorMsg('Login failed');
      }
    }
  };

  return (
    <div className="login-page">
      <h2>登錄</h2>
      {errorMsg && <p className="error-msg">{errorMsg}</p>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>信箱:</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        <div className="form-group">
          <label>密碼:</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        <button type="submit" className="login-btn">Login</button>
      </form>
      <button 
        type="button" 
        onClick={() => navigate('/signup')}
        className="signup-link-btn"
      >
        註冊
      </button>
    </div>
  );
}

export default LoginPage;
