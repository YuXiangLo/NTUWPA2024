// src/pages/MapPage.js
import React from 'react';
import './MapPage.css';

function MapPage() {
  return (
    <div className="map-page">
      <h2>Maps</h2>
      {/* You can embed your map component or library here */}
      <img src="/assets/maps.jpeg" alt="Map" />
      <p>Find legal services and court locations near you.</p>
    </div>
  );
}

export default MapPage;