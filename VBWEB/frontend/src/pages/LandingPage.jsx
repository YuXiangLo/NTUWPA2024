import React from 'react';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';
import { LandmarkProvider } from '../context/LandmarkContext.jsx';
import TaipeiMap from '../components/TaipeiMap.jsx';
import LandmarkList from '../components/LandmarkList.jsx';


function LandingPage() {
  const navigate = useNavigate();

  return (
    <LandmarkProvider>
      <div className="landing-page">
        <main className="landing-main">
          <div className="map-container">
            <TaipeiMap />
          </div>
          <aside className="sidebar">
            <button className="sidebar-btn" onClick = {() => navigate("/court-info")}>搜尋場地</button>
            <button className="sidebar-btn">報名比賽</button>
            <button className="sidebar-btn">新增比賽</button>
            <button className="sidebar-btn">新增場館</button>
            <LandmarkList />
          </aside>
        </main>
      </div>
    </LandmarkProvider>
  );
}

export default LandingPage;