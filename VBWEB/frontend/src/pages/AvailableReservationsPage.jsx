// src/pages/AvailableReservationsPage.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_DOMAIN } from '../config';
import './AvailableReservationsPage.css';

export default function AvailableReservationsPage() {
  const { user } = useAuth();
  const userId = user?.userid;
  const token = user?.accessToken;

  const [resvs, setResvs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);

    fetch(`${API_DOMAIN}/reservations/available`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error(`Error ${r.status}`);
        return r.json();
      })
      .then(data => {
        console.log(data);
        // annotate each reservation with userStatus
        const annotated = data.map(r => {
          const myReq = (r.requests || []).find(j => j.user_id === userId);
          const userStatus = myReq
            ? myReq.status   // "pending" / "rejected" / "approved"
            : 'none';
          return { ...r, userStatus };
        });
        setResvs(annotated);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [token, userId]);

  const handleJoin = async (reservationId) => {
    try {
      const res = await fetch(
        `${API_DOMAIN}/reservations/${reservationId}/join-requests`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!res.ok) {
        // if conflict (already applied), we still set to pending
        if (res.status === 409) {
          setResvs(rs =>
            rs.map(r =>
              r.id === reservationId ? { ...r, userStatus: 'pending' } : r
            )
          );
          return;
        }
        throw new Error(`Error ${res.status}`);
      }
      // success → mark pending
      setResvs(rs =>
        rs.map(r =>
          r.id === reservationId ? { ...r, userStatus: 'pending' } : r
        )
      );
    } catch (err) {
      alert(`申請失敗：${err.message}`);
    }
  };

  if (loading) return <p>載入中…</p>;
  if (error)   return <p className="error">錯誤：{error}</p>;

  return (
    <div className="avail-res-page">
      <h2>可預約場次</h2>
      <table className="avail-res-table">
        <thead>
          <tr>
            <th>場地</th>
            <th>球場</th>
            <th>發起者</th>
            <th>時段</th>
            <th>名額</th>
            <th>已加入</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {resvs.map(r => {
            const a = r.applicant;
            const label = `${a.lastname} ${a.firstname}${a.nickname?` (${a.nickname})`:''}`;
            const isFull = r.currentPlayers >= r.num_players;

            // decide button based solely on annotated userStatus
            let actionNode;
            switch (r.userStatus) {
              case 'pending':
                actionNode = <button className="btn-pending" disabled>已申請</button>;
                break;
              case 'rejected':
                actionNode = <button className="btn-rejected" disabled>被拒絕</button>;
                break;
              case 'approved':
                actionNode = <span className="joined">已加入</span>;
                break;
              default:
                // no request yet
                actionNode = isFull
                  ? <span className="full">額滿</span>
                  : <button
                      className="btn-join"
                      onClick={() => handleJoin(r.id)}
                    >
                      申請加入
                    </button>;
            }

            return (
              <tr key={r.id}>
                <td>{r.court.venue.name}</td>
                <td>{r.court.name}</td>
                <td>{label}</td>
                <td>
                  {new Date(r.start_ts).toLocaleString()}<br/>
                  {new Date(r.end_ts).toLocaleString()}
                </td>
                <td>{r.num_players}</td>
                <td>{r.currentPlayers}/{r.num_players}</td>
                <td>{actionNode}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
