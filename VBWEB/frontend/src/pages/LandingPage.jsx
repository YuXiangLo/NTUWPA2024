import React, { useContext, useEffect, useRef } from 'react';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';
import { LandmarkProvider, LandmarkContext } from '../context/LandmarkContext.jsx';
import TaipeiMap from '../components/TaipeiMap.jsx';
import LandmarkList from '../components/LandmarkList.jsx';

function LandingPageInner() {
  const navigate = useNavigate();
  const { setAddCourtMode, addCourtMode } = useContext(LandmarkContext);
  const mapContainerRef = useRef(null);

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
    <div className="landing-page">
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
          <button className="sidebar-btn">報名比賽</button>
          <button className="sidebar-btn">新增比賽</button>
          <button className="sidebar-btn" onClick={() => setAddCourtMode(true)}>
            新增場館
          </button>
          <button className="sidebar-btn" onClick={() => navigate("/ChatRoom")}>
            聊天室
          </button>
          <button className="sidebar-btn" onClick={() => navigate("/venue-application")}>
            場館申請
          </button>
          <button className="sidebar-btn" onClick={() => navigate("/admin-review-applications")}>
            管理場館申請
          </button>
          <button className="sidebar-btn" onClick={() => navigate("/admin-review-applications")}>
            管理維護者申請
          </button>
          <button className="sidebar-btn" onClick={() => navigate("/my-venues")}>
            我的場地
          </button>
          <LandmarkList />
        </aside>
      </main>
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
