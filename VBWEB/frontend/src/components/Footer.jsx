// src/components/Footer.js
import React from 'react';
import './Footer.css'; // Create your own CSS as needed

function Footer() {
  return (
    <footer className="footer">
      <p>&copy; {new Date().getFullYear()} NTUWPA2024.</p>
    </footer>
  );
}

export default Footer;