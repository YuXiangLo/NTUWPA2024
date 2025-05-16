// src/pages/CourtReservationApplyPage.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_DOMAIN } from '../config';

export default function CourtReservationApplyPage() {
  const { venueId, courtId } = useParams();
  const { user } = useAuth();
  const token = user?.accessToken;
  const navigate = useNavigate();
  const { state } = useLocation();
  const { slot, venueName, courtName } = state || {};

  // if someone lands here directly, go back
  useEffect(() => {
    if (!slot || !venueName || !courtName) {
      navigate(-1);
    }
  }, [slot, venueName, courtName, navigate]);

  // format slot date as YYYY-MM-DD
  const pad = n => n.toString().padStart(2, '0');
  const slotDate = slot
    ? `${slot.start.getFullYear()}-${pad(slot.start.getMonth()+1)}-${pad(slot.start.getDate())}`
    : '';

  const [numPlayers, setNumPlayers] = useState(1);
  const [fee, setFee]               = useState('');
  const [visibility, setVisibility] = useState('public');
  const [detail, setDetail]         = useState('');
  const [statusMsg, setStatusMsg]   = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const startTs = `${slotDate}T${slot.open_time}`;
    const endTs   = `${slotDate}T${slot.close_time}`;

    try {
      const res = await fetch(
        `${API_DOMAIN}/venues/${venueId}/courts/${courtId}/reservations`,
        {
          method: 'POST',
          headers: {
            'Content-Type':'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            startTs,
            endTs,
            numPlayers,
            fee: fee ? parseFloat(fee) : null,
            visibility,
            detail
          })
        }
      );
      if (!res.ok) throw new Error(`Error ${res.status}`);
      alert('申請已送出，待管理者審核');
      navigate('/');
    } catch(err) {
      setStatusMsg(`送出失敗：${err.message}`);
    }
  };

  return (
    <div className="apply-page">
      {/* Show venue & court names */}
      <div className="apply-header">
        <h2>場館：{venueName} , 場地： {courtName}</h2>
        <h3>預約申請表</h3>
      </div>

      {slot && (
        <form onSubmit={handleSubmit} className="apply-form">
          {/* Read-only date */}
          <label>
            日期
            <input
              type="date"
              value={slotDate}
              readOnly
            />
          </label>

          {/* Read-only time */}
          <label>
            開始時間
            <input
              type="time"
              value={slot.open_time}
              readOnly
            />
          </label>
          <label>
            結束時間
            <input
              type="time"
              value={slot.close_time}
              readOnly
            />
          </label>

          {/* User inputs */}
          <label>
            人數
            <input
              type="number"
              min="1"
              value={numPlayers}
              onChange={e => setNumPlayers(+e.target.value)}
              required
            />
          </label>

          <label>
            費用（選填）
            <input
              type="number"
              min="0"
              step="0.01"
              value={fee}
              onChange={e => setFee(e.target.value)}
            />
          </label>

          <label>
            可見性
            <select
              value={visibility}
              onChange={e => setVisibility(e.target.value)}
            >
              <option value="public">公開</option>
              <option value="private">私密</option>
              <option value="friend">好友</option>
            </select>
          </label>

          <label>
            說明
            <textarea
              value={detail}
              onChange={e => setDetail(e.target.value)}
            />
          </label>

          <button type="submit">送出申請</button>
          {statusMsg && <p className="status">{statusMsg}</p>}
        </form>
      )}

      <Link to={`/venues/${venueId}/courts/${courtId}/schedule`} className="btn-back">
        ← 返回時段列表
      </Link>
    </div>
  );
}
