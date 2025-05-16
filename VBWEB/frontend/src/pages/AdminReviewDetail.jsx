// src/pages/AdminReviewDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_DOMAIN } from '../config';

export default function AdminReviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = user?.accessToken;

  const [app, setApp] = useState(null);
  const [error, setError] = useState(null);
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [coords, setCoords] = useState(''); // combined lat,lon input

  useEffect(() => {
    const fetchDetail = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_DOMAIN}/maintainer_applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        const item = data.find(a => a.id === id);
        setApp(item);
        if (item?.location) {
          const [lon, lat] = item.location;
          setLongitude(lon);
          setLatitude(lat);
          setCoords(`${lat}, ${lon}`);
        }
      } catch (err) {
        setError(err.message);
      }
    };
    fetchDetail();
  }, [id, token]);

  const handleCoordChange = e => {
    const val = e.target.value;
    setCoords(val);
    const parts = val.split(',');
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim());
      const lon = parseFloat(parts[1].trim());
      if (!isNaN(lat) && !isNaN(lon)) {
        setLatitude(lat);
        setLongitude(lon);
      }
    }
  };

  const handleReview = async action => {
    try {
      const body =
        action === 'approve'
          ? { longitude: parseFloat(longitude), latitude: parseFloat(latitude) }
          : {};
      const res = await fetch(
        `${API_DOMAIN}/maintainer_applications/${id}/${action}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );
      if (!res.ok) throw new Error(`Error ${res.status}`);
      navigate('/admin-review-applications');
    } catch (err) {
      alert(`操作失敗：${err.message}`);
    }
  };

  if (!app) return <p>{error ? `錯誤：${error}` : '載入中…'}</p>;

  return (
    <div className="admin-review-detail">
      <h2>申請詳情</h2>
      <div className="detail-grid">
        <div><strong>申請者：</strong> {app.user_id}</div>
        <div><strong>場地名稱：</strong> {app.venue_name}</div>
        <div><strong>地址：</strong> {app.address}</div>
        <div><strong>電話：</strong> {app.phone}</div>
      </div>
      <div className="description">
        <strong>說明：</strong>
        <p>{app.detail}</p>
      </div>
      <div className="location-inputs">
        <label>
          經緯度 (緯度, 經度)
          <input
            type="text"
            value={coords}
            onChange={handleCoordChange}
            placeholder="25.031291572016002, 121.5303620693936"
          />
        </label>
      </div>
      <div className="images">
        {app.image1 && <img src={app.image1} alt="證明1" className="thumbnail" />}
        {app.image2 && <img src={app.image2} alt="證明2" className="thumbnail" />}
      </div>
      <div className="actions">
        <button onClick={() => handleReview('approve')} className="approve">
          通過
        </button>
        <button onClick={() => handleReview('reject')} className="reject">
          拒絕
        </button>
      </div>
    </div>
  );
}