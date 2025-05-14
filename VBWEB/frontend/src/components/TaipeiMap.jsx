import React, { useContext } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
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

function AddCourtHandler() {
  const { addCourtMode, setAddCourtMode, landmarks, setLandmarks } = useContext(LandmarkContext);

  useMapEvents({
    click: (e) => {
      if (addCourtMode) {
        const courtName = prompt("請輸入新球館名稱:");
        if (courtName) {
          const newCourt = {
            name: courtName,
            coords: [e.latlng.lat, e.latlng.lng],
          };
          setLandmarks([...landmarks, newCourt]);
        }
        // Turn off add mode once a click is handled.
        setAddCourtMode(false);
      }
    },
  });
  return null;
}
export default function TaipeiMap() {
  const { landmarks, selectedPosition, userLocation } = useContext(LandmarkContext);

  return (
    <div style={{ width: 800, height: 600 }}>
      <MapContainer center={selectedPosition} zoom={12} style={{ width: "100%", height: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController position={selectedPosition} />

        {/* render your “real” venues */}
        {landmarks.map((lm, i) => (
          <Marker key={i} position={lm.coords} icon={customIcon}>
            <Popup>{lm.name}</Popup>
          </Marker>
        ))}

        {/* render the user’s location too */}
        {userLocation && (
          <Marker position={userLocation.coords} icon={customIcon}>
            <Popup>我的位置</Popup>
          </Marker>
        )}

        <AddCourtHandler />
      </MapContainer>
    </div>
  );
}
