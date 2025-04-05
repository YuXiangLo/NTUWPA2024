// src/pages/CourtInfoPage.js
import React from 'react';
import './CourtInfoPage.css';

function CourtInfoPage() {
  return (
    <div className="court-info-page">
      <h2>Court Information</h2>
      {/* Render court details and related information */}
      <img src="/assets/court-info.png" alt="Court Info" />
      <p>Latest details on court proceedings will be displayed here.</p>
    </div>
  );
}

export default CourtInfoPage;