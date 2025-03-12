import React, { useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import landmarks from "./landmarks"; // Import landmarks

// Fix missing marker issue by setting a default icon
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41], // Default Leaflet size
  iconAnchor: [12, 41], // Adjusted to position correctly
  popupAnchor: [1, -34], // Adjusted popup position
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

// Component to control the map view dynamically
const MapController = ({ position }) => {
  const map = useMap();
  map.setView(position, 14, { animate: true }); // Zoom in and animate
  return null;
};

const TaipeiMap = () => {
  // React state to store selected landmark position
  const [selectedPosition, setSelectedPosition] = useState([25.0330, 121.5654]); // Default: Taipei 101
  const mapRef = useRef(null); // Reference for map

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
      {/* Sidebar for Landmark List */}
      <div style={{ width: "250px", background: "#000000", padding: "10px", borderRadius: "5px" }}>
        <h3>Landmarks</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {landmarks.map((landmark, index) => (
            <li
              key={index}
              onClick={() => setSelectedPosition(landmark.coords)} // Update map position
              style={{
                padding: "10px",
                cursor: "pointer",
                borderBottom: "1px solid #ddd",
                transition: "0.3s",
                background: selectedPosition[0] === landmark.coords[0] ? "#ddd" : "transparent",
              }}
            >
              {landmark.name}
            </li>
          ))}
        </ul>
      </div>

      {/* Map */}
      <div style={{ width: "800px", height: "600px" }}>
        <MapContainer
          center={selectedPosition}
          zoom={12}
          style={{ width: "100%", height: "100%" }}
          ref={mapRef}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Change Map View when clicking a landmark */}
          <MapController position={selectedPosition} />

          {/* Add Markers for each landmark */}
          {landmarks.map((landmark, index) => (
            <Marker key={index} position={landmark.coords} icon={customIcon}>
              <Popup>{landmark.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default TaipeiMap;

