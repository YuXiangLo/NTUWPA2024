import React, { useContext } from "react";
import { LandmarkContext } from "../context/LandmarkContext";

const FontColor = "#eeeeee"

const LandmarkList = () => {
  const { landmarks, setSelectedPosition, selectedPosition } = useContext(LandmarkContext);

  const handleDoubleClick = (coords) => {
    const [lat, lng] = coords;
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, "_blank");
  };

  return (
    <div style={{ width: "250px", background: "#303030", padding: "10px", borderRadius: "5px" }}>
      <h3 style={{color: FontColor}}>Landmarks</h3>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {landmarks.map((landmark, index) => (
          <li
            key={index}
            onClick={() => setSelectedPosition(landmark.coords)}
            onDoubleClick={() => handleDoubleClick(landmark.coords)}
            style={{
              padding: "10px",
              cursor: "pointer",
              borderBottom: "1px solid #ddd",
              transition: "0.3s",
              background: selectedPosition[0] === landmark.coords[0] ? "#202020" : "transparent",
              color: FontColor,
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

