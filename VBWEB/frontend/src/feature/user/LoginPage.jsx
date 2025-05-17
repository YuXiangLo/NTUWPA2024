// src/pages/user/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation }    from 'react-router-dom';
import { API_DOMAIN, GOOGLE_CLIENT_ID } from '../../config.js';
import { useAuth }                      from '../../context/AuthContext.jsx';

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // After auth, go here (default "/")
  const redirect = new URLSearchParams(location.search).get('redirect') || '/';

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Handle Google popup response
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
      login(data);                    // Save your JWTs / user state
      navigate(redirect, { replace: true });
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
    }
  };

  useEffect(() => {
    // Wait for Google's script to load
    if (!window.google?.accounts) return;

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback:  handleGoogleResponse,  // Popup mode callback
    });

    google.accounts.id.renderButton(
      document.getElementById('google-login-btn'),
      { theme: 'outline', size: 'large' }
    );

    // Optionally show the One-Tap prompt:
    // google.accounts.id.prompt();
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
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message);
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
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>密碼:</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="login-btn">
          登入
        </button>
      </form>

      {/* Google Login Button */}
      <div id="google-login-btn"></div>

      <button
        type="button"
        className="signup-link-btn"
        onClick={() => navigate('/signup')}
      >
        註冊
      </button>
    </div>
  );
}
