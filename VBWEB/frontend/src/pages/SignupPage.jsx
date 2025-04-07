// src/pages/SignupPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_DOMAIN } from '../config.js';
import './SignupPage.css';

function SignupPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Validate that passwords match
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    try {
      const response = await fetch(`${API_DOMAIN}user/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('User registered:', data);
        // Navigate to the user info page after successful registration
        navigate('/user-info');
      } else {
        const errorData = await response.json();
        setErrorMsg(errorData.message || 'Sign up failed');
      }
    } catch (error) {
      console.error('Error during signup:', error);
      setErrorMsg('Sign up failed');
    }
  };

  return (
    <div className="signup-page">
      <h2>Sign Up</h2>
      {errorMsg && <p className="error-msg">{errorMsg}</p>}
      <form onSubmit={handleSignup}>
        <label>
          Email:
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </label>
        <label>
          Password:
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </label>
        <label>
          Confirm Password:
          <input 
            type="password" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required 
          />
        </label>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default SignupPage;
