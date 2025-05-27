// src/pages/user/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation }    from 'react-router-dom';
import { API_DOMAIN, GOOGLE_CLIENT_ID } from '../../config.js';
import { useAuth }                      from '../../context/AuthContext.jsx';
import './LoginPage.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleGoogleResponse = async (response) => {
    const credential = response.credential;
    if (!credential) {
      setErrorMsg('Google 登錄失敗，請再試一次');
      return;
    }
    try {
      const res = await fetch(`${API_DOMAIN}/auth/google`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ token: credential }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Google 登錄失敗');
      }
      const data = await res.json();
      login(data);
      navigate(redirect, { replace: true });
      return;
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  useEffect(() => {
    if (!window.google?.accounts) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback:  handleGoogleResponse,
    });
    window.google.accounts.id.renderButton(
      document.getElementById('google-login-btn'),
      { theme: 'outline', size: 'large' }
    );
  }, [redirect]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!email || !password) {
      setErrorMsg('請輸入信箱與密碼');
      return;
    }
    try {
      const res = await fetch(`${API_DOMAIN}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || '登入失敗');
      }
      const data = await res.json();
      login(data);
      navigate(redirect, { replace: true });
      return;
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="login-page">
      <div className="page-header">
        <h2>登錄</h2>
      </div>

      {errorMsg && <p className="status">{errorMsg}</p>}

      <form className="login-form">
        <label>
          信箱
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />
        </label>
        <label>
          密碼
          <input 
            type="password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
          />
        </label>
        <div className="button-group">
          <button onClick={handleLogin} className="button-ops">
            登入
          </button>
          <button
            className="button-ops"
            onClick={() => navigate('/signup')}
          >
            註冊
          </button>
        </div>
        <div id="google-login-btn" className="google-btn"></div>
      </form>
    </div>
  );
}
