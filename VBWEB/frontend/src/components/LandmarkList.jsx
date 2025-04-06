import React, { useContext } from "react";
import { LandmarkContext } from "../context/LandmarkContext";

const FontColor = "#333333" // Changed to dark color for light background

const LandmarkList = () => {
  const { landmarks, setSelectedPosition, selectedPosition } = useContext(LandmarkContext);

  const handleDoubleClick = (coords) => {
    const [lat, lng] = coords;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  return (
    <div style={{ 
      width: "250px", 
      background: "#ffffff", // Changed to white
      padding: "10px", 
      borderRadius: "5px",
      boxShadow: "0 2px 4px rgba(0,0,0,0.1)" // Added subtle shadow
    }}>
      <h3 style={{color: FontColor}}>Courts</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {landmarks.map((landmark, index) => (
          <li
            key={index}
            onClick={() => setSelectedPosition(landmark.coords)}
            onDoubleClick={() => handleDoubleClick(landmark.coords)}
            style={{
              padding: "10px",
              cursor: "pointer",
              borderBottom: "1px solid #eee",
              transition: "0.3s",
              background: selectedPosition[0] === landmark.coords[0] ? "#f0f0f0" : "transparent",
              color: FontColor,
              hover: {
                background: "#f5f5f5"
              }
            }}
          >
            {landmark.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LandmarkList;

