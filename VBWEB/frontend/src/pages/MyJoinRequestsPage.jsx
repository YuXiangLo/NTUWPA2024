// src/pages/MyJoinRequestsPage.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_DOMAIN } from '../config';
import { Link } from 'react-router-dom';
import Calendar from '../components/Calendar';
import './MyJoinRequestsPage.css';

export default function MyJoinRequestsPage() {
  const { user } = useAuth();
  const token = user?.accessToken;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const statusColors = {
    pending: '#888888',
    approved: '#1e90ff'
  };

  useEffect(() => {
    if (!token) return;
    fetch(`${API_DOMAIN}/join-requests/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { if (!r.ok) throw new Error(`Error ${r.status}`); return r.json(); })
      .then(data => setRequests(data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p>載入中…</p>;
  if (error)   return <p className='error'>錯誤：{error}</p>;

  const calendarEvents = requests
    .filter(req => req.status === 'pending' || req.status === 'approved')
    .map(req => {
      const { reservation } = req;
      const { court, start_ts, end_ts, num_players } = reservation;
      return {
        id: req.id,
        start: start_ts,
        end: end_ts,
        text: `${court.venue.name} - ${court.name}`,
        participants: num_players,
        tag: req.status
      };
    });

  return (
    <div className='my-join-page'>
      <h2>排程日曆</h2>
      <Calendar eventsData={calendarEvents} />

      <h2>我的行程表</h2>
      {requests.length === 0 ? (
        <p>目前沒有任何加入請求。</p>
      ) : (
        <table className='my-join-table'>
          <thead>
            <tr>
              <th>場地</th><th>球場</th><th>時段</th><th>人數/費用</th><th>可見性</th><th>狀態</th><th>操作</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => {
              const { reservation } = req;
              const { court, start_ts, end_ts, num_players, fee, visibility } = reservation;
              const timeslot = `${new Date(start_ts).toLocaleString()} – ${new Date(end_ts).toLocaleString()}`;
              return (
                <tr key={req.id}>  
                  <td>{court.venue.name}</td>
                  <td>{court.name}</td>
                  <td>{timeslot}</td>
                  <td>{num_players} / {fee ?? '免費'}</td>
                  <td>{visibility}</td>
                  <td style={{ color: statusColors[req.status] }}>{req.status}</td>
                  <td>
                    {req.status === 'approved' ? (
                      <Link to={`/reservations/${reservation.id}`} className='btn-detail'>查看詳情</Link>
                    ) : <em>—</em>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
