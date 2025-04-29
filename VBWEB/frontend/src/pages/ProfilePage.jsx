// src/components/UserInfoForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import { API_DOMAIN } from '../config.js';
import { useAuth } from '../context/AuthContext.jsx';

function UserInfoForm() {
  const navigate = useNavigate();

  // Form state for user information
  const [lastname, setLastname] = useState('');
  const [firstname, setFirstname] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [location, setLocation] = useState('');
  const [level, setLevel] = useState('');
  const [photo, setPhoto] = useState('');

  // Loading state: true until profile data is loaded.
  const [isLoading, setIsLoading] = useState(true);

  // Using auth context to get user token
  const { user } = useAuth();
  const token = user?.accessToken;

  // Fetch current user profile info on component mount to prepopulate the form fields.
  useEffect(() => {
    console.log(user);
    const fetchProfile = async () => {
      if (!token) {
        console.error('User token is missing.');
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(`${API_DOMAIN}/user/profile`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          const errorData = await response.json();
          console.error('Failed to fetch profile:', errorData);
          setIsLoading(false);
          return;
        }
        const data = await response.json();
        // Update form fields with the fetched profile data.
        setFirstname(data.firstname || '');
        setLastname(data.lastname || '');
        setNickname(data.nickname || '');
        setPhone(data.phone || '');
        setBirthday(data.birthday || '');
        setLocation(data.location || '');
        setLevel(data.level !== undefined ? data.level.toString() : '');
        setPhoto(data.photo || '');
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      console.error('User token is missing.');
      return;
    }

    const updateData = {
      firstname,
      lastname,
      nickname,
      phone,
      birthday,
      location,
      level: Number(level), // Convert level to a number if necessary
      photo,
    };

    try {
      const response = await fetch(`${API_DOMAIN}user/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to update profile:', errorData);
        return;
      }
      console.log('Profile updated successfully!');
      navigate('/'); // Navigate to landing or profile page after update
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (isLoading) {
    // Render a loading message or spinner while waiting for data
    return <div className="user-info-form"><h2>Loading...</h2></div>;
  }

  return (
    <div className="user-info-form">
      <h2>Complete Your Profile</h2>
      <form onSubmit={handleProfileSubmit}>
        <label>
          Last Name:
          <input 
            type="text" 
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            required
          />
        </label>
        <label>
          First Name:
          <input 
            type="text" 
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
            required
          />
        </label>
        <label>
          Nickname:
          <input 
            type="text" 
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
          />
        </label>
        <label>
          Phone:
          <input 
            type="text" 
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        <label>
          Birthday:
          <input 
            type="date" 
            value={birthday}
            onChange={(e) => setBirthday(e.target.value)}
          />
        </label>
        <label>
          Location:
          <input 
            type="text" 
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </label>
        <label>
          Level:
          <input 
            type="number" 
            value={level}
            onChange={(e) => setLevel(e.target.value)}
          />
        </label>
        <label>
          Photo URL:
          <input 
            type="text" 
            value={photo}
            onChange={(e) => setPhoto(e.target.value)}
          />
        </label>
        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
}

export default UserInfoForm;
