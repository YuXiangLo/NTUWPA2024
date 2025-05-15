// src/components/UserInfoForm.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';
import { API_DOMAIN } from '../config.js';
import { useAuth } from '../context/AuthContext.jsx';
import UserDashboard from '../components/userDashboard.jsx';

function ProfilePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = user?.accessToken;

  // Form state
  const [lastname, setLastname] = useState('');
  const [firstname, setFirstname] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [birthday, setBirthday] = useState('');
  const [location, setLocation] = useState('');
  const [level, setLevel] = useState('');
  const [photo, setPhoto] = useState('');          // holds current avatar URL
  const [photoPreview, setPhotoPreview] = useState(null); // local preview

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Fetch and populate profile
  useEffect(() => {
    async function fetchProfile() {
      if (!token) return setIsLoading(false);
      try {
        const res = await fetch(`${API_DOMAIN}/user/profile`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw await res.json();
        const data = await res.json();
        setFirstname(data.firstname || '');
        setLastname(data.lastname || '');
        setNickname(data.nickname || '');
        setPhone(data.phone || '');
        setBirthday(data.birthday || '');
        setLocation(data.location || '');
        setLevel(data.level != null ? String(data.level) : '');
        setPhoto(data.photo ? `${data.photo}?t=${Date.now()}` : '');
      } catch (err) {
        console.error('Fetch profile error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, [token]);

  // Resize image on client to max 300x300
  const resizeImage = (file) => {
    const maxDim = 300;
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > height) {
          if (width > maxDim) {
            height *= maxDim / width;
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width *= maxDim / height;
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => resolve(blob), file.type, 0.8);
      };
    });
  };

  // Handle avatar upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !token) return;

    // show local preview immediately
    setPhotoPreview(URL.createObjectURL(file));
    setUploading(true);
    setUploadError('');
    try {
      const blob = await resizeImage(file);
      const form = new FormData();
      form.append('photo', blob, file.name);

      const res = await fetch(`${API_DOMAIN}/user/photo`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });
      if (!res.ok) throw await res.json();
      const updated = await res.json();
      // bust cache by appending timestamp
      setPhoto(`${updated.photo}?t=${Date.now()}`);
      setPhotoPreview(null);
    } catch (err) {
      console.error('Upload photo error:', err);
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Profile submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;
    const updateData = { firstname, lastname, nickname, phone, birthday, location, level: Number(level) };
    try {
      const res = await fetch(`${API_DOMAIN}/user/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(updateData)
      });
      if (!res.ok) throw await res.json();
      navigate('/');
    } catch (err) {
      console.error('Update profile error:', err);
    }
  };

  if (isLoading)
    return (
      <div className="profile-page">
        <h1>Loading...</h1>
      </div>
    );
  

  return (
    <div className="profile-page">
      <div className="user-info-form grid-layout">
        <h2>Complete Your Profile</h2>
        <div className="avatar-section">
          {uploadError && <div className="error">{uploadError}</div>}
          <img
            src={photoPreview || photo}
            alt=""
            className="avatar-preview"
          />
          <div className="file-input-wrapper">
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              disabled={uploading}
            />
            <label htmlFor="file-upload" className="upload-btn">
              {uploading ? '上傳中' : '選擇照片'}
            </label>
          </div>
        </div>
        <form onSubmit={handleProfileSubmit} className="form-section">
          <div className="form-row">
            <label>First Name
              <input type="text" value={firstname} onChange={e => setFirstname(e.target.value)} required/>
            </label>
            <label>Last Name
              <input type="text" value={lastname} onChange={e => setLastname(e.target.value)} required/>
            </label>
          </div>
          <div className="form-row">
            <label>Nickname
              <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} />
            </label>
            <label>Phone
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} />
            </label>
          </div>
          <div className="form-row">
            <label>Birthday
              <input type="date" value={birthday} onChange={e => setBirthday(e.target.value)} />
            </label>
            <label>Location
              <input type="text" value={location} onChange={e => setLocation(e.target.value)} />
            </label>
          </div>
          <label>Level
            <input type="number" value={level} onChange={e => setLevel(e.target.value)} />
          </label>
          <button type="submit" className="save-btn">Save Profile</button>
        </form>
      </div>

      {/* <UserDashboard /> */}
    </div>
  );
}

export default ProfilePage;
