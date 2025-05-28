// src/pages/MyPlayPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_DOMAIN } from '../../config';
import { Link, useNavigate } from 'react-router-dom';
import Calendar from '../../components/Calendar';
import './MyPlayPage.css';

export default function MyPlayPage() {
  const { user } = useAuth();
  const token = user?.accessToken;
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const hasAlerted = useRef(false);

  // new state to control popup
  const [showCalendarModal, setShowCalendarModal] = useState(false);

  const statusColors = {
    pending:  '#888888',
    approved: '#1e90ff',
    rejected: '#dc3545'
  };

  useEffect(() => {
    setLoading(true);

    if (!token) {
      if (!hasAlerted.current) {
        alert('請先登入才能查看「我的行程表」');
        hasAlerted.current = true;
      }
      navigate('/login');
      return;
    }
    
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

        const combined = [
          ...data1.map(req => ({ ...req, type: 'court' })),
          ...data2.map(req => ({ ...req, type: 'custom' })),
        ];
        setRequests(combined);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <h1 className="center-fullpage">Loading...</h1>
    );
  }

  if (error) {
    return (
      <h1 className="center-fullpage">Error: {error}</h1>
    );
  }

  const calendarEvents = requests
    .filter(req => req.status === 'pending' || req.status === 'approved')
    .map(req => {
      const res   = req.reservation;
      const venue = req.type === 'court'
        ? res.court.venue.name
        : res.venue_name;
      const court = req.type === 'court'
        ? res.court.name
        : res.court_name;
      return {
        id:           req.id,
        start:        res.start_ts,
        end:          res.end_ts,
        text:         `${venue} - ${court}`,
        participants: res.num_players,
        tag:          req.status
      };
    });

  return (
    <div className="my-join-page">
      {/* Button to open calendar modal */}
      <h2>我的行程表</h2>

      <button
        className="button-ops"
        onClick={() => setShowCalendarModal(true)}
      >
        開啟排程日曆
      </button>

      {/* Calendar Modal */}
      {showCalendarModal && (
        <div
          className="calendar-modal-overlay"
          onClick={() => setShowCalendarModal(false)}
        >
          <div
            className="calendar-modal-content"
            onClick={e => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowCalendarModal(false)}
            >
              &times;
            </button>
            <h2>排程日曆</h2>
            <Calendar eventsData={calendarEvents} />
          </div>
        </div>
      )}

      {requests.length === 0 ? (
        <table className="my-join-table">
          <thead>
            <tr>
              <th>名稱</th>
              <th>屬性</th>
              <th>說明</th> 
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="no-data">尚未新增任何球場。</td>
            </tr>
          </tbody>
        </table>
      ) : (
        <table className="my-join-table">
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
              const res   = req.reservation;
              const venue = req.type === 'court'
                ? res.court.venue.name
                : res.venue_name;
              const court = req.type === 'court'
                ? res.court.name
                : res.court_name;
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
                      <Link
                        to={
                          req.type === 'court'
                            ? `/reservations/${res.id}/detail`
                            : `/custom-reservations/${res.id}/detail`
                        }
                        className="btn-detail"
                      >
                        查看詳情
                      </Link>
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
