// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_DOMAIN } from '../config.js';
import { useAuth } from '../context/AuthContext';
import './LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
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
          // Assume data includes { token, user: { ... } }
          login(data);
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
      <h2>Login</h2>
      {errorMsg && <p className="error-msg">{errorMsg}</p>}
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label>Email:</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
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
        Sign Up
      </button>
    </div>
  );
}

export default LoginPage;
