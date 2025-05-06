// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import Notificatoins from './pages/Notifications';
import CourtInfoPage from './pages/CourtInfoPage';
import SchedulePage from './pages/CourtSchedule';
import SearchVenueListPage from './pages/SearchVenueListPage';
import ChatRoomPage from './pages/ChatRoomPage';
import TestPage from './pages/TestPage';
import './App.css';
import FriendListWidget from './components/FriendListWidget';
import VenueApplication from './pages/VenueApplication';

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
          <Route path="/notifications" element={<Notificatoins />} />
          <Route path="/schedule/:court_id" element={<SchedulePage />} />
          <Route path="/court-info" element={<CourtInfoPage />} />
          <Route path="/search-venue" element={<SearchVenueListPage />} />
          <Route path="/ChatRoom" element={<ChatRoomPage />} />
          <Route path="/test" element={<TestPage />} />
          <Route path="/venue-application" element={<VenueApplication />} />
          {/* Add more routes as needed */}
        </Routes>
      </main>
      <FriendListWidget />
      <Footer />
    </Router>
  );
}

export default App;
