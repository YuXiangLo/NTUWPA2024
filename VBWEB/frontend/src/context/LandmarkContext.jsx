import React, { createContext, useState } from "react";
import landmarks from "../data/Landmarks"; // Import landmarks from separate file

// Create Context
export const LandmarkContext = createContext();

export const LandmarkProvider = ({ children }) => {
  // State to track selected landmark position
  const [selectedPosition, setSelectedPosition] = useState([25.0173, 121.5398]); // Default: Taipei 101

  return (
    <LandmarkContext.Provider value={{ landmarks, selectedPosition, setSelectedPosition }}>
      {children}
    </LandmarkContext.Provider>
  );
};

