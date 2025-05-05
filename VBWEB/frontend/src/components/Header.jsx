// src/components/Header.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, notifications = [] } = useAuth();  
  // derive unread count however makes sense for your app
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="header">
      <div className="header-title" onClick={() => navigate('/')}>
        <h1>排球人綜合報名網站</h1>
      </div>

      {location.pathname !== '/login' && (
        <div className="header-buttons">
          {user && (
            <>
              <button
                className="notification-btn"
                onClick={() => navigate('/notifications')}
              >
                <FaBell size={18} />
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>

              {/* 主揪場次 button */}
              <button
                className="hosted-events-btn"
                onClick={() => navigate('/hosted-events')}
              >
                主揪場次
              </button>
            </>
          )}

          {user ? (
            <>
              <button onClick={() => navigate('/profile')}>個人專區</button>
              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
              >
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