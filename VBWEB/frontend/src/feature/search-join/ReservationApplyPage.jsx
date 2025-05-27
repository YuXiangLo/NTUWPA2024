import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_DOMAIN } from '../../config';
import './ReservationApplyPage.css';

export default function CourtReservationApplyPage() {
  const { venueId, courtId } = useParams();
  const { user } = useAuth();
  const token = user?.accessToken;
  const navigate = useNavigate();
  const { state } = useLocation();
  const { slot, venueName, courtName } = state || {};

  useEffect(() => {
    if (!slot || !venueName || !courtName) {
      navigate(-1);
    }
  }, [slot, venueName, courtName, navigate]);

  const pad = n => n.toString().padStart(2, '0');
  const slotDate = slot
    ? `${slot.start.getFullYear()}-${pad(slot.start.getMonth()+1)}-${pad(slot.start.getDate())}`
    : '';

  const [numPlayers, setNumPlayers] = useState(1);
  const [fee, setFee]               = useState('');
  const [visibility, setVisibility] = useState('public');
  const [detail, setDetail]         = useState('');
  const [statusMsg, setStatusMsg]   = useState('');

  const handleSubmit = async e => {
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
    <div className="custom-res-page">
      <h2>場館：{venueName} ， 場地：{courtName}</h2>
      <h2>預約申請表</h2>

      {slot && (
        <form className="custom-res-form" onSubmit={handleSubmit}>
          <label>
            日期 *
            <input
              type="date"
              name="slotDate"
              value={slotDate}
              readOnly
            />
          </label>

          <label>
            開始時間 *
            <input
              type="time"
              name="startTime"
              value={slot.open_time}
              readOnly
            />
          </label>

          <label>
            結束時間 *
            <input
              type="time"
              name="endTime"
              value={slot.close_time}
              readOnly
            />
          </label>

          <label>
            人數 *
            <input
              type="number"
              name="numPlayers"
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
              name="fee"
              min="0"
              step="0.01"
              value={fee}
              onChange={e => setFee(e.target.value)}
            />
          </label>

          <label>
            可見性 *
            <select
              name="visibility"
              value={visibility}
              onChange={e => setVisibility(e.target.value)}
            >
              <option value="public">公開</option>
              <option value="friend">好友</option>
              <option value="private">私密</option>
            </select>
          </label>

          <label>
            詳細說明（選填）
            <textarea
              name="detail"
              value={detail}
              onChange={e => setDetail(e.target.value)}
            />
          </label>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button type="submit">送出申請</button>
            <button onClick={() => navigate(`/venues/${venueId}/courts/${courtId}/schedule`)}>
              ← 返回時段列表
            </button>
          </div>
          {statusMsg && <p className="status">{statusMsg}</p>}
        </form>
      )}
    </div>
  );
}
