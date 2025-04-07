// src/components/Header.js
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  // Use a shared auth state (or context) if needed.
  const isLoggedIn = false;

  return (
    <header className="header">
      <div className="header-title" onClick={() => navigate('/')}>
        <h1>排球人綜合報名網站</h1>
        {/* <p>點擊滑動地圖以選擇不同地點之球館位置</p> */}
      </div>
      {location.pathname !== '/login' && (
        <div className="header-buttons">
          {isLoggedIn ? (
            <>
              <button onClick={() => navigate('/profile')}>個人專區</button>
              <button onClick={() => { /* Add logout logic */ navigate('/'); }}>
                登出
              </button>
            </>
          ) : (
            <button onClick={() => navigate('/login')}>登入</button>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;