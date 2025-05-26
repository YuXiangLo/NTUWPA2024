// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import LandingPage from './feature/landing/LandingPage.jsx';
import LoginPage from './feature/user/LoginPage';
import SignupPage from './feature/user/SignupPage';
import ProfilePage from './feature/user/ProfilePage';
import MyPlayPage from './feature/user/MyPlayPage.jsx';
import PlayDetailPage from './feature/user/PlayDetailPage.jsx';
import AdminReviewApplications from './feature/admin/AdminReviewVenueApplications';
import AdminReviewDetail from './feature/admin/AdminReviewDetail';
import MyVenues from './feature/manage-venue/MyVenues.jsx';
import VenueApplication from './feature/manage-venue/VenueApplication.jsx';
import CreateCourt from './feature/manage-court/CreateCourt';
import CourtsDashboard from './feature/manage-court/CourtsDashboard.jsx';
import ManageCourtSchedule from './feature/manage-court/ManageCourtSchedule.jsx';
import ManageReservationsApplyPage from './feature/manage-court/ManageReservationsApplyPage.jsx';
import ReservationsDashboardPage from './feature/manage-reservation/ReservationsDashboardPage.jsx';
import ReservationJoinRequestsPage from './feature/manage-reservation/ReservationJoinRequestsPage.jsx';
import ReservationApplyPage from './feature/search-join/ReservationApplyPage.jsx';
import CustomReservationPage from './feature/self-court-reservation/CustomReservationPage';
import AvailableReservationsPage from './feature/search-join/AvailableReservationsPage.jsx';
import SearchVenueListPage from './feature/search-join/SearchVenueListPage';
import CourtDetailPage from './feature/search-join/CourtDetailPage.jsx';
import ChatRoomPage from './feature/chat/ChatRoomPage';
import FriendListWidget from './components/FriendListWidget';
import GoogleCallback from './feature/user/google-callback';
import { AnimatedBackground } from 'animated-backgrounds';

function App() {
  return (
    <Router>
      <Header />
	  <
        AnimatedBackground
        animationName="geometricShapes"
		blendMode="normal"
        style={{ "background": "linear-gradient(to bottom right, #e3f2fd, #fce4ec)"}}
      />
      <main className="global-main">
        <Routes>
          {/* Public / auth */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/my-play" element={<MyPlayPage />} />
          <Route path="/:type/:reservationId/detail" element={<PlayDetailPage />} />
          <Route path="/google-callback" element={<GoogleCallback />} />
          {/* admin */}
          <Route path="/admin-review-applications" element={<AdminReviewApplications />} />
          <Route path="/admin-review-applications/:id" element={<AdminReviewDetail />} />
          {/* Venue related */}
          <Route path="/venue-application" element={<VenueApplication />} />
          <Route path="/my-venues" element={<MyVenues />} />
          {/* Court related */}
          <Route path="/venues/:venueId/courts">
            <Route path="" element={<CourtsDashboard />} />
            <Route path="new" element={<CreateCourt />} />
            <Route path=":courtId/manage-schedule" element={<ManageCourtSchedule />} />
            <Route path=":courtId/schedule" element={<CourtDetailPage />} />
            <Route path=":courtId/reserve" element={<ReservationApplyPage />} />
            <Route path=":courtId/reservations" element={<ManageReservationsApplyPage />} />
          </Route>
          {/* Reservation related */}
          <Route path="/reservations/my" element={<ReservationsDashboardPage />} />
          <Route path=":type/:reservationId/join-requests" element={<ReservationJoinRequestsPage />} />
          {/* Custom reservation */}
          <Route path="/custom-reservation" element={<CustomReservationPage />} />
          {/*search-join*/}
          <Route path="/search-venue" element={<SearchVenueListPage />} />
          <Route path="/reservations/available" element={<AvailableReservationsPage />} />
          {/*chat*/}
          <Route path="/ChatRoom" element={<ChatRoomPage />} />
        </Routes>
      </main>
      <FriendListWidget />
    </Router>
  );
}

export default App;
