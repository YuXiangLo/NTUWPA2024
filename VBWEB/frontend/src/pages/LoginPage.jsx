// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_DOMAIN } from '../config.js';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (email && password) {
      try {
        const response = await fetch(`${API_DOMAIN}user/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Logged in:', data);
          navigate('/');
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
      <h2>Welcome Back!</h2>
      {errorMsg && <p className="error-msg">{errorMsg}</p>}
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label htmlFor="email">Email</label>
          <input 
            id="email"
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Password</label>
          <input 
            id="password"
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>
        <button type="submit" className="login-btn">Login</button>
      </form>
      <div>Don't have an account? </div>
      <button 
        type="button" 
        onClick={() => navigate('/signup')}
        className="signup-link-btn"
      >
        Sign Up
      </button>
    </div>
  );
}

export default LoginPage;
