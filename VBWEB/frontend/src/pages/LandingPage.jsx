import React, { useContext } from 'react';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';
import { LandmarkProvider, LandmarkContext } from '../context/LandmarkContext.jsx';
import TaipeiMap from '../components/TaipeiMap.jsx';
import LandmarkList from '../components/LandmarkList.jsx';

function LandingPageInner() {
  const navigate = useNavigate();
  const { setAddCourtMode, addCourtMode } = useContext(LandmarkContext);

  return (
    <div className="landing-page">
      <main className="landing-main">
        <div className="map-container">
          <TaipeiMap />
          {addCourtMode && (
            <div className="add-court-hint">
              請在地圖上點一下以新增場館
            </div>
          )}
        </div>
        <aside className={`sidebar ${addCourtMode ? 'dimmed' : ''}`}>
          <button className="sidebar-btn" onClick={() => navigate("/court-info")}>
            搜尋場地
          </button>
          <button className="sidebar-btn">報名比賽</button>
          <button className="sidebar-btn">新增比賽</button>
          <button className="sidebar-btn" onClick={() => setAddCourtMode(true)}>
            新增場館
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