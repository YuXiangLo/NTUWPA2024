import React, { createContext, useState, useEffect } from 'react';
import initialLandmarks from '../data/Landmarks.jsx';

export const LandmarkContext = createContext();

export const LandmarkProvider = ({ children }) => {
  const [landmarks, setLandmarks] = useState(initialLandmarks);
  const [selectedPosition, setSelectedPosition] = useState(initialLandmarks[0]?.coords || null);
  const [addCourtMode, setAddCourtMode] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await fetch('http://localhost:3000/venues', {
          headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        const data = await res.json();

        const mapped = data.map(venue => ({
          name: venue.name,
          coords: venue.coords,
          venueId: venue.venue_id,
          status: venue.status,
          openingHours: venue.opening_hours,
          courts: venue.court
        }));

        setLandmarks(mapped);
        setSelectedPosition(mapped[0]?.coords || null);
      } catch (err) {
        console.error('Failed to load venues:', err);
        setError(err);
        // fallback to your bundled data
        setLandmarks(initialLandmarks);
        setSelectedPosition(initialLandmarks[0]?.coords || null);
      } 
    };

    fetchVenues();
  }, []);

  return (
    <LandmarkContext.Provider
      value={{
        landmarks,
        setLandmarks,
        selectedPosition,
        setSelectedPosition,
        addCourtMode,
        setAddCourtMode,
        userLocation,
        setUserLocation,
      }}
    >
      {children}
    </LandmarkContext.Provider>
  );
};

