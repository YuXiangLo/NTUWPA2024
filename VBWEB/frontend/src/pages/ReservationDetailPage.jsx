// src/pages/ReservationDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_DOMAIN } from '../config';
import './ReservationDetailPage.css';

export default function ReservationDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const token = user?.accessToken;

  const [resv, setResv] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_DOMAIN}/reservations/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setResv(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, token]);

  if (loading) return <div className="loader">載入中…</div>;
  if (error)   return <div className="error">錯誤：{error}</div>;
  if (!resv)  return null;

  const { start_ts, end_ts, num_players, fee, visibility, detail, status, applicant, court, participants } = resv;

  return (
    <div className="resv-detail-page">
      <div className="resv-grid">
        <div className="card" style={{ textAlign: 'left' }}>
          <h2 className="card-title" style={{ textAlign: 'left' }}>預約詳情</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">場地 / 球場</span>
              <span className="value">場地：{court.venue.name} , 球場： {court.name}</span>
            </div>
            <div className="info-item">
              <span className="label">場地地址</span>
              <span className="value">{court.venue.address}</span>
            </div>
            <div className="info-item">
              <span className="label">發起者</span>
              <span className="value">
                {applicant.lastname} {applicant.firstname}{applicant.nickname && ` (${applicant.nickname})`}
              </span>
            </div>
            <div className="info-item">
              <span className="label">時段</span>
              <span className="value">
                {new Date(start_ts).toLocaleString()}<br />
                {new Date(end_ts).toLocaleString()}
              </span>
            </div>
            <div className="info-item">
              <span className="label">人數 / 費用 / 可見性</span>
              <span className="value">{num_players} 人 / {fee ?? '免費'} / {visibility}</span>
            </div>
            <div className="info-item full-width">
              <span className="label">說明</span>
              <span className="value">{detail || '—'}</span>
            </div>
          </div>
        </div>

        <div className="card participants-card">
          <h3 className="card-subtitle">已加入成員 ({participants.length}/{num_players})</h3>
          {participants.length === 0 ? (
            <p className="empty">目前尚無其他成員。</p>
          ) : (
            <ul className="participants-list">
              {participants.map(p => (
                <li key={p.id} className="participant-item">
                  {p.lastname} {p.firstname}{p.nickname && ` (${p.nickname})`}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <Link to="/my-join-requests" className="btn-back">← 返回我的預約</Link>
    </div>
  );
}
