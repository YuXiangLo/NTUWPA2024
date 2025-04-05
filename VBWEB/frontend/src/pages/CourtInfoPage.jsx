import React, { useState } from 'react';
import './CourtInfoPage.css';
import ntuImage from '../assets/ntu.png'; // adjust the path as needed


function CourtInfoPage() {
  const [advancedFiltersVisible, setAdvancedFiltersVisible] = useState(false);
  const toggleAdvancedFilters = () => {
    setAdvancedFiltersVisible(!advancedFiltersVisible);
  };

  return (
    <div className="court-info-page">
      {/* Top Section: Title and Search */}
      <header className="court-info-header">
        <h2>搜尋場地</h2>
        <div className="search-container">
          <input
            type="text"
            placeholder="Search 球館、名字"
            className="search-input"
          />
          <button className="search-button">Search</button>
        </div>
      </header>

      {/* Filter Section */}
      <section className="filter-section">
        <div className="filter-row">
          <div className="filter-group">
            <span className="filter-label">報隊類型:</span>
            <button className="filter-btn">自由報隊</button>
            <button className="filter-btn">付費參加</button>
          </div>

          <div className="filter-group">
            <span className="filter-label">網子:</span>
            <button className="filter-btn">男排</button>
            <button className="filter-btn">女排</button>
            <button className="filter-btn">混排</button>
          </div>

          <button 
            className={`advanced-filter-toggle ${advancedFiltersVisible ? 'active' : ''}`} 
            onClick={toggleAdvancedFilters}
          >
            {advancedFiltersVisible ? '▲ 收起篩選' : '▼ 進階篩選'}
          </button>
        </div>

        {advancedFiltersVisible && (
          <div className="advanced-filters">
            <div className="filter-group">
              <span className="filter-label">場地:</span>
              <button className="filter-btn">室外水泥</button>
              <button className="filter-btn">室外沙排</button>
              <button className="filter-btn">室外草地</button>
              <button className="filter-btn">室內PVC</button>
              <button className="filter-btn">室內水泥</button>
              <button className="filter-btn">室內木頭</button>
              <button className="filter-btn">室內沙排</button>
            </div>

            <div className="filter-group">
              <span className="filter-label">程度:</span>
              <button className="filter-btn">A</button>
              <button className="filter-btn">B</button>
              <button className="filter-btn">C</button>
              <button className="filter-btn">D</button>
            </div>
          </div>
        )}
      </section>

      {/* Main Content: Table + Mobile Preview */}
      <div className="main-content">
        {/* Court Table */}
        <section className="court-table-section">
          <table className="court-table">
            <thead>
              <tr>
                <th>場地名稱</th>
                <th>地址</th>
                <th>組別</th>
                <th>場地類型</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {/* Sample row */}
              <tr>
                <td>Example Court</td>
                <td>台北市大安區</td>
                <td>男團</td>
                <td>PVC</td>
                <td>
                  <button className="sign-up-btn">報名</button>
                </td>
              </tr>
              <tr>
                <td>Another Court</td>
                <td>台北市信義區</td>
                <td>混團</td>
                <td>室內</td>
                <td>
                  <button className="sign-up-btn">報名</button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* Mobile Preview (Right Side) */}
        <aside className="mobile-preview">
          <img
            src={ntuImage}
            alt="Mobile App Preview"
            className="mobile-image"
          />
          {/* If you want to show more info or buttons here, feel free */}
        </aside>
      </div>
    </div>
  );
}

export default CourtInfoPage;