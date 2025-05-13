import React, { createContext, useState, useEffect } from 'react';
import initialLandmarks from '../data/Landmarks.jsx';
import { API_DOMAIN } from '../config.js';

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
        const res = await fetch(`${API_DOMAIN}/venues`, {
          headers: { 'Accept': 'application/json' }
        });
        if (!res.ok) throw new Error(`API error: ${res.status}`);
  
        const data = await res.json();
        const filteredData = data.filter(venue => 
          Array.isArray(venue.location) && 
          venue.location.length === 2 && 
          typeof venue.location[0] === 'number' && 
          typeof venue.location[1] === 'number' &&
          !isNaN(venue.location[0]) && 
          !isNaN(venue.location[1])
        );
        
        const mapped = filteredData.map(venue => ({
          name:        venue.name,
          coords:      venue.location,
          venueId:     venue.id,
          address:     venue.address,
          phone:       venue.phone,
          // if you want courts/openingHours later, fetch /venues/:id
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

