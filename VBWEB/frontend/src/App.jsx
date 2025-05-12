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
import AdminReviewApplications from './pages/AdminReviewApplications';
import AdminReviewDetail from './pages/AdminReviewDetail';
import MyVenues from './pages/MyVenues';
import CreateCourt from './pages/CreateCourt';
import ManageCourts from './pages/ManageCourts.jsx';
import ManageSchedule from './pages/ManageSchedule.jsx';
import CourtDetailPage from './pages/CourtDetailPage';
import CourtReservationApply from './pages/CourtReservationApplyPage';
import ManageReservationsPage from './pages/ManageReservationsPage';

function App() {
  return (
    <Router>
      <Header />
      <main>
        <Routes>
          {/* Public / auth */}
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

          {/* Venue applications */}
          <Route path="/venue-application" element={<VenueApplication />} />
          <Route path="/admin-review-applications" element={<AdminReviewApplications />} />
          <Route path="/admin-review-applications/:id" element={<AdminReviewDetail />} />

          {/* Maintainer’s own venues */}
          <Route path="/my-venues" element={<MyVenues />} />

          {/* Courts under a venue */}
          <Route path="/venues/:venueId/courts">
            {/* create new court must come first */}
            <Route path="new" element={<CreateCourt />} />
            {/* list/manage courts */}
            <Route path="" element={<ManageCourts />} />
            {/* maintainer’s schedule editor */}
            <Route path=":courtId/manage-schedule" element={<ManageSchedule />} />
            {/* public schedule/details */}
            <Route path=":courtId/schedule" element={<CourtDetailPage />} />
            {/* apply for reservation */}
            <Route path=":courtId/reserve" element={<CourtReservationApply />} />
            {/* manage reservations */}
            <Route path=":courtId/reservations" element={<ManageReservationsPage />} />
          </Route>
        </Routes>
      </main>
      <FriendListWidget />
      <Footer />
    </Router>
  );
}

export default App;
