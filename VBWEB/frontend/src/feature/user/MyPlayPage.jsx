// src/pages/MyJoinRequestsPage.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_DOMAIN } from '../../config';
import { Link } from 'react-router-dom';
import Calendar from '../../components/Calendar';

export default function MyPlayPage() {
  const { user } = useAuth();
  const token = user?.accessToken;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const statusColors = {
    pending:  '#888888',
    approved: '#1e90ff',
    rejected: '#dc3545'
  };

  useEffect(() => {
    if (!token) return;
    setLoading(true);

    Promise.all([
      fetch(`${API_DOMAIN}/join-requests/my`, {
        headers: { Authorization: `Bearer ${token}` }
      }),
      fetch(`${API_DOMAIN}/custom-reservations/my`, {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])
      .then(async ([r1, r2]) => {
        if (!r1.ok) throw new Error(`Error ${r1.status}`);
        if (!r2.ok) throw new Error(`Error ${r2.status}`);
        const [data1, data2] = await Promise.all([r1.json(), r2.json()]);

        // tag each with type and combine
        const combined = [
          ...data1.map(req => ({ ...req, type: 'court' })),
          ...data2.map(req => ({ ...req, type: 'custom' })),
        ];
        setRequests(combined);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);


  if (loading) return <p>載入中…</p>;
  if (error)   return <p className="app-error">錯誤：{error}</p>;

  // build events for calendar
  const calendarEvents = requests
    .filter(req => req.status === 'pending' || req.status === 'approved')
    .map(req => {
      // unified reservation object
      if (req.type === 'court') {
        const res = req.reservation;
        const venue = res.court.venue.name;
        const court = res.court.name;
        return {
          id:           req.id,
          start:        res.start_ts,
          end:          res.end_ts,
          text:         `${venue} - ${court}`,
          participants: res.num_players,
          tag:          req.status
        };
      } else {
        const res = req.reservation;
        const venue = res.venue_name;
        const court = res.court_name;
        return {
          id:           req.id,
          start:        res.start_ts,
          end:          res.end_ts,
          text:         `${venue} - ${court}`,
          participants: res.num_players,
          tag:          req.status
        };
      } 
    });

  return (
    <div className="app-card-page">
      <h1>排程日曆</h1>
      <div className="app-form-group">
        <Calendar eventsData={calendarEvents} />
      </div>

      <h1>我的行程表</h1>
      {requests.length === 0 ? (
        <p>目前沒有任何加入請求。</p>
      ) : (
        <table className="app-table">
          <thead>
            <tr>
              <th>場地</th>
              <th>球場</th>
              <th>時段</th>
              <th>人數</th>
              <th>費用</th>
              <th>可見性</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => {
              let res, court, venue;
              if (req.type === 'court') {
                res = req.reservation;
                venue = res.court.venue.name;
                court = res.court.name;
              } else {
                res = req.reservation;
                venue = res.venue_name;
                court = res.court_name;
              }
              const timeslot = `${new Date(res.start_ts).toLocaleString()} – ${new Date(res.end_ts).toLocaleString()}`;
              return (
                <tr key={`${req.type}-${req.id}`}>
                  <td>{venue}</td>
                  <td>{court}</td>
                  <td>{timeslot}</td>
                  <td>{res.num_players}</td>
                  <td><em>{res.fee ?? '免費'}</em></td>
                  <td>{res.visibility}</td>
                  <td style={{ color: statusColors[req.status] }}>
                    {req.status}
                  </td>
                  <td>
                    {req.status === 'approved' ? (
                      req.type === 'court' ? (
                        <Link
                          to={`/reservations/${res.id}/detail`}
                          className="btn-detail"
                        >
                          查看詳情
                        </Link>
                      ) : (
                        <Link
                          to={`/custom-reservations/${res.id}/detail`}
                          className="btn-detail"
                        >
                          查看詳情
                        </Link>
                      )
                    ) : (
                      <em>—</em>
                    )}
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
