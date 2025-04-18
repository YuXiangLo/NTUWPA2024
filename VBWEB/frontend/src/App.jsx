// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import CourtInfoPage from './pages/CourtInfoPage';
import SchedulePage from './pages/CourtSchedule';
import SearchVenueListPage from './pages/SearchVenueListPage';
import './App.css';

function App() {
  return (
    <Router>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/schedule/:court_id" element={<SchedulePage />} />
          <Route path="/court-info" element={<CourtInfoPage />} />
          <Route path="/search-venue" element={<SearchVenueListPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}

export default App;