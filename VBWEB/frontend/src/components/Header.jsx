// src/components/Header.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
    navigate('/');
  };

  // Don't show login/logout buttons on login page
  const showAuthButtons = location.pathname !== '/login';

  return (
    <header className="header">
      <div className="header-title" onClick={() => navigate('/')}>
        <h1>排球人綜合報名網站</h1>
      </div>
      {showAuthButtons && (
        <div className="header-buttons">
          {isLoggedIn ? (
            <>
              <button className="profile-btn" onClick={() => navigate('/profile')}>
                個人專區
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                登出
              </button>
            </>
          ) : (
            <button className="login-btn" onClick={() => navigate('/login')}>
              登入
            </button>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;