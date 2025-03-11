import { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const center = {
  lat: 25.033964, // Taipei coordinates (example)
  lng: 121.564472,
};

const locations = [
  { lat: 25.035, lng: 121.565 },
  { lat: 25.032, lng: 121.562 },
];

export default function VolleyballIndex() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-100 p-4 space-y-4">
        <h1 className="text-xl font-bold">排球人的網</h1>
        <button className="w-full bg-orange-500 text-white py-2 rounded">登入</button>
        <button className="w-full bg-blue-500 text-white py-2 rounded">報名打場</button>
        <button className="w-full bg-green-500 text-white py-2 rounded">組隊比賽</button>
        <button className="w-full bg-purple-500 text-white py-2 rounded">觀看比賽</button>
      </div>
      
      {/* Map Section */}
      <div className="w-3/4">
        <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
          <GoogleMap mapContainerStyle={mapContainerStyle} center={center} zoom={14}>
            {locations.map((loc, index) => (
              <Marker key={index} position={loc} />
            ))}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
}
