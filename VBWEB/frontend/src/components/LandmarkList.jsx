// src/components/LandmarkList.jsx
import React, { useContext, useState } from "react";
import { LandmarkContext } from "../context/LandmarkContext";
import { MapPin } from "lucide-react";

export default function LandmarkList() {
  const {
    landmarks,
    userLocation,
    setUserLocation,
    selectedPosition,
    setSelectedPosition,
  } = useContext(LandmarkContext);
  const [locLoading, setLocLoading] = useState(false);

  const onClickMyLocation = () => {
    if (!navigator.geolocation) {
      return alert("Geolocation not supported");
    }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const coordsArr = [coords.latitude, coords.longitude];
        setUserLocation({ name: "My Location", coords: coordsArr });
        setSelectedPosition(coordsArr);
        setLocLoading(false);
      },
      (err) => {
        alert(`Error: ${err.message}`);
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const items = [
    { name: locLoading ? "Locating…" : "My Location", coords: userLocation?.coords, isUser: true },
    ...landmarks,
  ];

  return (
    <div
      style={{
        width: '100%',
        background: "#fff",
        padding: 10,
        borderRadius: 5,
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        overflowY: 'auto'
      }}
    >
      <h3 style={{ color: "#333", marginTop: 0 }}>Courts</h3>
      <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((item, i) => {
          const isSelected =
            item.coords &&
            selectedPosition &&
            selectedPosition[0] === item.coords[0] &&
            selectedPosition[1] === item.coords[1];
          return (
            <li
              key={i}
              onClick={() => item.isUser ? onClickMyLocation() : setSelectedPosition(item.coords)}
              onDoubleClick={() => {
                if (!item.coords) return;
                const [lat, lng] = item.coords;
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                padding: 10,
                cursor: item.isUser && locLoading ? "not-allowed" : "pointer",
                background: isSelected ? "#f0f0f0" : "transparent",
                borderBottom: "1px solid #eee",
                opacity: item.isUser && locLoading ? 0.6 : 1,
              }}
            >
              {item.isUser && <MapPin size={14} style={{ marginRight: 6 }} />}
              {item.name}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

