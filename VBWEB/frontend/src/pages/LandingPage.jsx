import React from 'react';
import './LandingPage.css';
import { LandmarkProvider } from '../context/LandmarkContext.jsx';
import TaipeiMap from '../components/TaipeiMap.jsx';
import LandmarkList from '../components/LandmarkList.jsx';

function LandingPage() {
  return (
    <LandmarkProvider>
      <div className="landing-page">
        {/* Header Section */}
        <header className="landing-header">
          <div className="header-title">
            <h1>排球人綜合報名網站</h1>
            <p>點擊滑動地圖以選擇不同地點之球館位置</p>
          </div>
          <div className="header-buttons">
            <button className="profile-btn">個人專區</button>
            <button className="logout-btn">登出</button>
          </div>
        </header>

        {/* Main Content */}
        <main className="landing-main">
          <div className="map-container">
            <TaipeiMap />
          </div>
          <aside className="sidebar">
            <button className="sidebar-btn">搜尋場地</button>
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