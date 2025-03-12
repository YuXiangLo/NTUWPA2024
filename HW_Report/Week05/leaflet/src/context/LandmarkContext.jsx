import React, { createContext, useState } from "react";
import landmarks from "../landmarks"; // Import landmarks from separate file

// Create Context
export const LandmarkContext = createContext();

export const LandmarkProvider = ({ children }) => {
  // State to track selected landmark position
  const [selectedPosition, setSelectedPosition] = useState([25.0330, 121.5654]); // Default: Taipei 101

  return (
    <LandmarkContext.Provider value={{ landmarks, selectedPosition, setSelectedPosition }}>
      {children}
    </LandmarkContext.Provider>
  );
};

