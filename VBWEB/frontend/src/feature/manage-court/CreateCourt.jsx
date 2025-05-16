import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_DOMAIN } from '../../config';

export default function CreateCourt() {
  const { venueId } = useParams();
  const { user } = useAuth();
  const token = user?.accessToken;
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [property, setProperty] = useState('');
  const [detail, setDetail] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!token) {
      setStatusMessage('請先登入');
      return;
    }
    if (!name.trim()) {
      setStatusMessage('請填寫球場名稱');
      return;
    }

    setSubmitting(true);
    setStatusMessage('');
    try {
      const res = await fetch(
        `${API_DOMAIN}/venues/${venueId}/courts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, property, detail }),
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      navigate(`/venues/${venueId}/courts`);
    } catch (err) {
      setStatusMessage(`錯誤：${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="create-court">
      <h2>新增球場</h2>
      <form onSubmit={handleSubmit}>
        <label>
          球場名稱
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </label>

        <label>
          球場屬性
          <input
            type="text"
            value={property}
            onChange={e => setProperty(e.target.value)}
          />
        </label>

        <label>
          詳細說明
          <textarea
            value={detail}
            onChange={e => setDetail(e.target.value)}
          />
        </label>

        <button type="submit" disabled={submitting}>
          {submitting ? '送出中…' : '送出'}
        </button>
      </form>

      {statusMessage && (
        <p className="status">{statusMessage}</p>
      )}
    </div>
  );
}
