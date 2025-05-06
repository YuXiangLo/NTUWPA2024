// src/pages/AdminReviewDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminReviewDetail.css';
import { API_DOMAIN } from '../config';

export default function AdminReviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = user?.accessToken;
  const [app, setApp] = useState(null);
  const [error, setError] = useState(null);
  const [modalSrc, setModalSrc] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${API_DOMAIN}/maintainer_applications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const item = data.find(a => a.id === id);
        setApp(item);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchDetail();
  }, [id, token]);

  const handleReview = async (action) => {
    try {
      const res = await fetch(
        `${API_DOMAIN}/maintainer_applications/${id}/${action}`,
        { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error(`Error ${res.status}`);
      navigate('/admin-review-applications');
    } catch (err) {
      alert(`操作失敗：${err.message}`);
    }
  };

  if (!app) return <p>{error ? `錯誤：${error}` : '載入中…'}</p>;

  return (
    <>
      <div className="admin-review-detail">
        <h2>申請詳情</h2>
        <div className="detail-grid">
          <div><strong>申請者：</strong> {app.user_id}</div>
          <div><strong>場地名稱：</strong> {app.venue_name}</div>
          <div><strong>地址：</strong> {app.address}</div>
          <div><strong>電話：</strong> {app.phone}</div>
        </div>
        <div className="description"><strong>說明：</strong><p>{app.detail}</p></div>
        <div className="images">
          {app.image1 && (
            <img
              src={app.image1}
              alt="證明1"
              className="thumbnail"
              onClick={() => setModalSrc(app.image1)}
            />
          )}
          {app.image2 && (
            <img
              src={app.image2}
              alt="證明2"
              className="thumbnail"
              onClick={() => setModalSrc(app.image2)}
            />
          )}
        </div>
        <div className="actions">
          <button onClick={() => handleReview('approve')} className="approve">通過</button>
          <button onClick={() => handleReview('reject')} className="reject">拒絕</button>
        </div>
      </div>
      {modalSrc && (
        <div className="modal-overlay" onClick={() => setModalSrc(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalSrc(null)}>×</button>
            <img src={modalSrc} alt="原圖" className="modal-image" />
          </div>
        </div>
      )}
    </>
  );
}