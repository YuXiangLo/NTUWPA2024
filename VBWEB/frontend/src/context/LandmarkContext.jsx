import React, { createContext, useState } from 'react';
import initialLandmarks from '../data/Landmarks.jsx';

export const LandmarkContext = createContext();

export const LandmarkProvider = ({ children }) => {
  const [landmarks, setLandmarks] = useState(initialLandmarks);
  const [selectedPosition, setSelectedPosition] = useState(initialLandmarks[0].coords);
  const [addCourtMode, setAddCourtMode] = useState(false);

  return (
    <LandmarkContext.Provider
      value={{
        landmarks,
        setLandmarks,
        selectedPosition,
        setSelectedPosition,
        addCourtMode,
        setAddCourtMode,
      }}
    >
      {children}
    </LandmarkContext.Provider>
  );
};

