// src/pages/CourtDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_DOMAIN } from '../../config';
import { DayPilot } from "@daypilot/daypilot-lite-react";

export default function CourtDetailPage() {
  const { venueId, courtId } = useParams();
  const { user } = useAuth();
  const token = user?.accessToken;
  const navigate = useNavigate();

  const [venueName, setVenueName]       = useState('');
  const [courtName, setCourtName]       = useState('');
  const [openings, setOpenings]         = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [weekStart, setWeekStart]       = useState(new DayPilot.Date().firstDayOfWeek());

  const weekdayNames = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  useEffect(() => {
    if (!token) return;
    setLoading(true);

    const startDate = weekStart.toString("yyyy-MM-dd");
    const endDate   = weekStart.addDays(6).toString("yyyy-MM-dd");

    Promise.all([
      fetch(
        `${API_DOMAIN}/venues/${venueId}/courts/${courtId}/opening-hours`,
        { headers: { Authorization: `Bearer ${token}` } }
      ),
      fetch(
        `${API_DOMAIN}/courts/${courtId}/reservations?status=approved&start=${startDate}&end=${endDate}`,
        { headers: { Authorization: `Bearer ${token}` } }
      ),
      fetch(
        `${API_DOMAIN}/venues/${venueId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      ),
    ])
      .then(async ([ohRes, resRes, vdRes]) => {
        if (!ohRes.ok) throw new Error(`載入時段失敗：${ohRes.status}`);
        if (!resRes.ok) throw new Error(`載入預約失敗：${resRes.status}`);
        if (!vdRes.ok) throw new Error(`載入場地資訊失敗：${vdRes.status}`);

        const [ohData, resData, vdData] = await Promise.all([
          ohRes.json(),
          resRes.json(),
          vdRes.json(),
        ]);

        setOpenings(ohData);
        setReservations(resData);
        setVenueName(vdData.name || '');

        const court = (vdData.courts || []).find(c => c.id === courtId);
        setCourtName(court?.name || '');
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [venueId, courtId, token, weekStart]);

  if (loading) return <p>載入中…</p>;
  if (error)   return <p className="app-error">錯誤：{error}</p>;

  const slots = openings
    .map(rec => {
      const base    = new DayPilot.Date(weekStart).addDays(rec.day_of_week);
      const isoDate = base.toString("yyyy-MM-dd");
      const start   = new Date(`${isoDate}T${rec.open_time}`);
      const end     = new Date(`${isoDate}T${rec.close_time}`);
      return { ...rec, start, end };
    })
    .sort((a, b) => a.start - b.start);

  const isOccupied = slot =>
    reservations.some(r => {
      const rs = new Date(r.start_ts);
      const re = new Date(r.end_ts);
      return slot.start < re && rs < slot.end;
    });

  return (
    <div className="app-card-page">
      <Link to="/search-venue" className="app-btn" style={{ marginTop: 24 }}>← 回搜尋</Link>
      <h2>場館：{venueName} , 場地： {courtName}</h2>

      <p className="text-center" style={{ marginBottom: 16 }}>
        Week: {weekStart.toString("yyyy-MM-dd")} – {weekStart.addDays(6).toString("yyyy-MM-dd")}
      </p>

      <div className="app-btn-group" style={{ justifyContent: 'center', marginBottom: 16 }}>
        <button className="app-btn" onClick={() => setWeekStart(ws => ws.addDays(-7))}>← 上週</button>
        <button className="app-btn" onClick={() => setWeekStart(ws => ws.addDays(7))}>下週 →</button>
      </div>

      <table className="app-table">
        <thead>
          <tr>
            <th>日期</th>
            <th>星期</th>
            <th>時間</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {slots.map(slot => (
            <tr key={slot.id}>
              <td>{slot.start.toISOString().slice(5,10)}</td>
              <td>{weekdayNames[slot.day_of_week]}</td>
              <td>{slot.open_time} – {slot.close_time}</td>
              <td>
                {isOccupied(slot) ? (
                  <button className="app-btn app-btn-reject" disabled>已被預約</button>
                ) : (
                  <button
                    className="app-btn"
                    onClick={() =>
                      navigate(
                        `/venues/${venueId}/courts/${courtId}/reserve`,
                        { state: { slot, venueName, courtName } }
                      )
                    }
                  >
                    申請
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
