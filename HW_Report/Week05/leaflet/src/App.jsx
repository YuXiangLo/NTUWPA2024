import React from "react";
import { LandmarkProvider } from "./context/LandmarkContext";
import TaipeiMap from "./components/TaipeiMap";
import LandmarkList from "./components/LandmarkList";

function App() {
  return (
    <LandmarkProvider>
      <div
        style={{
          display: "flex",
          gap: "20px",
          padding: "20px",
          alignItems: "center", // Center items vertically
          justifyContent: "center", // Center items horizontally
          height: "100vh", // Full screen height
          width: "100vw", // Full screen height
        }}
      >
        <LandmarkList />
        <TaipeiMap />
      </div>
    </LandmarkProvider>
  );
}

export default App;

