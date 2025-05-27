// src/pages/AdminReviewDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_DOMAIN } from '../../config';
import './AdminReviewDetail.css';

export default function AdminReviewDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const token = user?.accessToken;

  const [app, setApp]       = useState(null);
  const [error, setError]   = useState(null);
  const [coords, setCoords] = useState('');

  const [previewSrc, setPreviewSrc] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_DOMAIN}/maintainer_applications`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then(data => {
        const item = data.find(a => a.id === id);
        setApp(item);
        if (item?.location) {
          const [lon, lat] = item.location;
          setCoords(`${lat}, ${lon}`);
        }
      })
      .catch(err => setError(err.message));
  }, [id, token]);

  const handleCoordChange = e => setCoords(e.target.value);

  const handleReview = async action => {
    const [lat, lon] = coords.split(',').map(s => parseFloat(s.trim()));
    const body = action === 'approve'
      ? { latitude: lat, longitude: lon }
      : {};
    try {
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

  if (error) return <p className="center-message error">錯誤：{error}</p>;
  if (!app)  return <p className="center-message">載入中…</p>;

  return (
    <div className="venue-app-form">
      <div className="page-header">
        <h2>申請詳情</h2>
      </div>

      <form className="custom-res-form">
        <label>
          申請者
          <input type="text" value={app.user_id} readOnly />
        </label>
        <label>
          場地名稱
          <input type="text" value={app.venue_name} readOnly />
        </label>
        <label>
          地址
          <input type="text" value={app.address} readOnly />
        </label>
        <label>
          電話
          <input type="text" value={app.phone} readOnly />
        </label>

        <label>
          說明
          <textarea value={app.detail} readOnly />
        </label>

        <label>
          <strong>經緯度</strong>
          <input
            type="text"
            value={coords}
            onChange={handleCoordChange}
            placeholder="ex: 25.03129, 121.53036"
          />
        </label>

        <label>
            <strong>場地照片</strong>
            <div className="preview-row">
                {app.image1 && (
                    <img
                        src={app.image1}
                        alt="證明1"
                        className="preview-image"
                        onClick={() => setPreviewSrc(app.image1)}
                    />
                )}
                {app.image2 && (
                    <img
                        src={app.image2}
                        alt="證明2"
                        className="preview-image"
                        onClick={() => setPreviewSrc(app.image2)}
                    />
                )}
            </div>
        </label>

        <div>
          <button
            type="button"
            className="button-ops-approve"
            onClick={() => handleReview('approve')}
          >
            通過
          </button>
          <button
            type="button"
            className="button-ops-reject"
            onClick={() => handleReview('reject')}
          >
            拒絕
          </button>
        </div>
        {/* 圖片預覽彈窗 */}
        {previewSrc && (
          <div className="img-modal" onClick={() => setPreviewSrc(null)}>
            <div className="img-modal-content" onClick={e => e.stopPropagation()}>
              <button className="button-close" onClick={() => setPreviewSrc(null)}>
                X
              </button>
              <img src={previewSrc} alt="Preview" />
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
