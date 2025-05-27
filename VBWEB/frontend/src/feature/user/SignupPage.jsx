// src/pages/SignupPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_DOMAIN } from '../../config.js';
import { useAuth } from '../../context/AuthContext.jsx';
import './SignupPage.css';

export default function SignupPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg]         = useState('');

  const handleSignup = async e => {
    e.preventDefault();
    setErrorMsg('');

    if (password !== confirmPassword) {
      setErrorMsg("密碼不一致");
      return;
    }

    try {
      const res = await fetch(`${API_DOMAIN}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || '註冊失敗');
      }

      const loginRes = await fetch(`${API_DOMAIN}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await loginRes.json();
      login(data);
      navigate('/profile');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  return (
    <div className="signup-page">
      <div className="page-header">
        <h2>註冊帳號</h2>
      </div>
      <form className="signup-form" onSubmit={handleSignup}>
        {errorMsg && <p className="status">{errorMsg}</p>}

        <label>
          電子郵件
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

        <label>
          確認密碼
          <input
            type="password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
        </label>

        <button type="submit" className="button-ops">
          註冊
        </button>
      </form>
    </div>
  );
}

