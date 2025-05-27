import React, { useContext, useEffect, useRef } from 'react';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';
import { LandmarkProvider, LandmarkContext } from '../../context/LandmarkContext.jsx';
import TaipeiMap from '../../components/TaipeiMap.jsx';
import LandmarkList from '../../components/LandmarkList.jsx';
import { useAuth } from '../../context/AuthContext';
import { API_DOMAIN } from '../../config';
import { useState } from 'react';

function LandingPageInner() {
  const navigate = useNavigate();
  const { setAddCourtMode, addCourtMode } = useContext(LandmarkContext);
  const mapContainerRef = useRef(null);
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetch(`${API_DOMAIN}/user/isadmin`, {
      headers: {
        'Authorization': `Bearer ${user?.accessToken}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setIsAdmin(data);
      })
      .catch(err => console.error(err));
  }, [user]);


  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setAddCourtMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setAddCourtMode]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (addCourtMode && mapContainerRef.current && !mapContainerRef.current.contains(e.target)) {
        setAddCourtMode(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [addCourtMode, setAddCourtMode]);

  return (
    <div className='landing-wrapper'>
      <div className="landing-page">
        <h1 className="landing-page-title">走 打球！</h1>
        <main className="landing-main">
          <div className="map-container" ref={mapContainerRef}>
            {addCourtMode && (
              <div className="add-court-hint">
                請在地圖上點一下以新增場館
              </div>
            )}
            <TaipeiMap />
          </div>
          <aside className={`sidebar ${addCourtMode ? 'dimmed' : ''}`}>
            <button className="sidebar-btn" onClick={() => navigate("/search-venue")}>
              搜尋場地
            </button>
            <button className="sidebar-btn" onClick={() => navigate("/reservations/available")}>
              搜尋報隊
            </button>
            <button className="sidebar-btn" onClick={() => navigate("/custom-reservation")}>
              自訂報隊
            </button>
            <button className="sidebar-btn" onClick={() => navigate("/my-play")}>
              我的報隊
            </button>
            {user && isAdmin && (
              <button className="sidebar-btn" onClick={() => navigate("/admin-review-applications")}>
                管理場館申請
              </button>
            )}
            <button className="sidebar-btn" onClick={() => navigate("/my-venues")}>
              我的場地
            </button>
            <button className="sidebar-btn" onClick={() => navigate("/reservations/my")}>
              管理報隊申請
            </button>
            <LandmarkList />
          </aside>
        </main>
      </div>
    </div>
  );
}

function LandingPage() {
  return (
    <LandmarkProvider>
      <LandingPageInner />
    </LandmarkProvider>
  );
}

export default LandingPage;