/* VenueApplication.jsx */
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_DOMAIN } from '../../config';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function VenueApplication() {
  const { user } = useAuth();
  const token = user?.accessToken;

  const [venueName, setVenueName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [detail, setDetail] = useState('');
  const [images, setImages] = useState({ image1: null, image2: null });
  const [statusMessage, setStatusMessage] = useState('');
  const [applicationId, setApplicationId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        setStatusMessage(`檔案 "${file.name}" 太大，請選擇小於 5MB 的圖片。`);
        return;
      }
      setStatusMessage('');
      setImages((prev) => ({ ...prev, [name]: file }));
    }
  };

  const safeParseJson = async (response) => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      return response.json();
    }
    return {};
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setStatusMessage('未登入，請先登入後再操作。');
      return;
    }

    setSubmitting(true);
    setStatusMessage('');
    setApplicationId(null);

    try {
      const formData = new FormData();
      formData.append('venueName', venueName);
      formData.append('address', address);
      formData.append('phone', phone);
      formData.append('detail', detail);
      if (images.image1) formData.append('image1', images.image1);
      if (images.image2) formData.append('image2', images.image2);

      const res = await fetch(`${API_DOMAIN}/maintainer_applications`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const errData = await safeParseJson(res);
        throw new Error(errData.message || `Error ${res.status}`);
      }

      const result = await safeParseJson(res);
      // Success popup and redirect
      window.alert('申請成功！');
      window.location.href = '/';

      // Optionally set status and id if needed
      setStatusMessage('申請已送出，待管理員審核。');
      setApplicationId(result.id || null);

      // reset form
      setVenueName('');
      setAddress('');
      setPhone('');
      setDetail('');
      setImages({ image1: null, image2: null });
    } catch (err) {
      console.error(err);
      setStatusMessage(`送出失敗：${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-card-page">
      <h1>申請場地管理員</h1>
      <form className="app-form" onSubmit={handleSubmit} encType="multipart/form-data">
        <label className="app-form-group">
          場地名稱
          <input
            className="app-input"
            type="text"
            value={venueName}
            onChange={(e) => setVenueName(e.target.value)}
            required
          />
        </label>

        <label className="app-form-group">
          地址
          <input
            className="app-input"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </label>

        <label className="app-form-group">
          聯絡電話
          <input
            className="app-input"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="e.g. 02-1234-5678"
          />
        </label>

        <label className="app-form-group">
          詳細說明
          <textarea
            className="app-input"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
          />
        </label>

        <div className="file-upload-group app-form-group">
          <label className="image-label">
            上傳證明圖片1
            <input
              className="app-input"
              type="file"
              name="image1"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </label>
          {images.image1 && (
            <img
              src={URL.createObjectURL(images.image1)}
              alt="證明1預覽"
              className="app-img-preview"
            />
          )}
        </div>

        <div className="file-upload-group app-form-group">
          <label className="image-label">
            上傳證明圖片2
            <input
              className="app-input"
              type="file"
              name="image2"
              accept="image/*"
              onChange={handleFileChange}
              required
            />
          </label>
          {images.image2 && (
            <img
              src={URL.createObjectURL(images.image2)}
              alt="證明2預覽"
              className="app-img-preview"
            />
          )}
        </div>

        <button type="submit" className="app-btn" disabled={submitting}>
          {submitting ? '送出中…' : '送出申請'}
        </button>
      </form>

      {statusMessage && <p className="app-error">{statusMessage}</p>}
      {applicationId && (
        <p className="app-status-joined">申請編號：{applicationId}</p>
      )}
    </div>
  );
}