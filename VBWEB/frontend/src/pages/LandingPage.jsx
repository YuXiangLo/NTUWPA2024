// src/pages/LandingPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css'; // Create and style according to your design

function LandingPage() {
  return (
    <div className="landing-page">
      <section className="hero">
        <h1>Welcome to Our Platform</h1>
        <p>Your one-stop solution for legal information and more.</p>
        <Link to="/signup" className="btn">Get Started</Link>
      </section>
      
      <section className="features">
        <div className="feature-item">
          <img src="/assets/court-info.png" alt="Court Info" />
          <h3>Court Info</h3>
          <p>Get the latest details on court proceedings and case updates.</p>
        </div>
        <div className="feature-item">
          <img src="/assets/maps.jpeg" alt="Maps" />
          <h3>Location Maps</h3>
          <p>Find courts and legal services near you.</p>
        </div>
        <div className="feature-item">
          <img src="/assets/profile.png" alt="Profile" />
          <h3>Your Profile</h3>
          <p>Manage your account and stay updated with personalized info.</p>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;