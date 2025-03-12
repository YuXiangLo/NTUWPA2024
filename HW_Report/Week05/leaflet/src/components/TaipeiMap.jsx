import React, { useContext } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { LandmarkContext } from "../context/LandmarkContext";

// Fix missing marker issue by setting a default icon
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

// Component to control map view when a landmark is selected
const MapController = ({ position }) => {
  const map = useMap();
  map.setView(position, 14, { animate: true });
  return null;
};

const TaipeiMap = () => {
  const { landmarks, selectedPosition } = useContext(LandmarkContext);

  // Redirect to Google Maps on double-clicking the marker
  const handleMarkerDoubleClick = (coords) => {
    const [lat, lng] = coords;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  return (
    <div style={{ width: "800px", height: "600px" }}>
      <MapContainer
        center={selectedPosition}
        zoom={12}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Change Map View when selecting a landmark */}
        <MapController position={selectedPosition} />

        {/* Add Markers for each landmark */}
        {landmarks.map((landmark, index) => (
          <Marker
            key={index}
            position={landmark.coords}
            icon={customIcon}
            eventHandlers={{
              dblclick: () => handleMarkerDoubleClick(landmark.coords), // Double-click redirects
            }}
          >
            <Popup>{landmark.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default TaipeiMap;

