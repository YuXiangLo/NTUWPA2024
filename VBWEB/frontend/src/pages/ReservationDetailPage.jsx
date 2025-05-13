// src/pages/ReservationDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_DOMAIN } from '../config';
import './ReservationDetailPage.css';

export default function ReservationDetailPage() {
  const { type, reservationId } = useParams();
  const { user }                = useAuth();
  const token                   = user?.accessToken;

  const [resv,   setResv]   = useState(null);
  const [loading,setLoading]= useState(true);
  const [error,  setError]  = useState(null);

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_DOMAIN}/${type}/${reservationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setResv(data);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [type, reservationId, token]);

  if (loading) return <div className="loader">載入中…</div>;
  if (error)   return <div className="error">錯誤：{error}</div>;
  if (!resv)   return null;

  // Distinguish court vs custom
  const isCourt = type === 'reservations';

  // Unified fields
  const venueName   = isCourt
    ? resv.court.venue.name
    : resv.venue_name;
  const address     = isCourt
    ? resv.court.venue.address
    : resv.address;
  const courtName   = isCourt
    ? resv.court.name
    : resv.court_name;
  const courtProp   = isCourt
    ? resv.court.property
    : resv.court_property;

  const {
    start_ts,
    end_ts,
    num_players,
    fee,
    visibility,
    detail,
    status,
    applicant,
    participants = []
  } = resv;

  return (
    <div className="resv-detail-page">
      <div className="resv-grid">
        <div className="card" style={{ textAlign: 'left' }}>
          <h2 className="card-title">預約詳情</h2>
          <div className="info-grid">
            <div className="info-item">
              <span className="label">場地 / 球場</span>
              <span className="value">
                場地：{venueName} ，球場：{courtName}
              </span>
            </div>
            <div className="info-item">
              <span className="label">場地地址</span>
              <span className="value">{address}</span>
            </div>
            {courtProp && (
              <div className="info-item">
                <span className="label">球場屬性</span>
                <span className="value">{courtProp}</span>
              </div>
            )}
            <div className="info-item">
              <span className="label">發起者</span>
              <span className="value">
                {applicant.lastname} {applicant.firstname}
                {applicant.nickname && ` (${applicant.nickname})`}
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
              <span className="value">
                {num_players} 人 / {fee ?? '免費'} / {visibility}
              </span>
            </div>
            <div className="info-item full-width">
              <span className="label">說明</span>
              <span className="value">{detail || '—'}</span>
            </div>
          </div>
        </div>

        <div className="card participants-card">
          <h3 className="card-subtitle">
            已加入成員 ({participants.length}/{num_players})
          </h3>
          {participants.length === 0 ? (
            <p className="empty">目前尚無其他成員。</p>
          ) : (
            <ul className="participants-list">
              {participants.map(p => (
                <li key={p.id} className="participant-item">
                  {p.lastname} {p.firstname}
                  {p.nickname && ` (${p.nickname})`}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Link
        to={'/my-join-requests'}
        className="btn-back"
      >
        ← 返回我的加入請求
      </Link>
    </div>
  );
}
