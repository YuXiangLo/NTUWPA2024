import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './UserInfoForm.css';

function UserInfoForm() {
  const navigate = useNavigate();
  const [lastname, setLastname] = useState('');
  const [firstname, setFirstname] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [location, setLocation] = useState('');
  const [level, setLevel] = useState('');
  const [photo, setPhoto] = useState('');

  // Get current user id from supabase auth
  const [userId, setUserId] = useState(null);
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUser();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!userId) return;
    // Construct update data for the users table
    const updateData = {
      lastname,
      firstname,
      nickname,
      phone,
      birthday,
      location,
      level,
      photo,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('userid', userId);
    if (error) {
      console.error('Failed to update profile:', error.message);
      return;
    }
    console.log('Profile updated');
    navigate('/'); // Navigate to landing or profile page
  };

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
            type="text" 
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