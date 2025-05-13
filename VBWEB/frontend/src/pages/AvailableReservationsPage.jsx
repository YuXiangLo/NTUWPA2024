// src/pages/AvailableReservationsPage.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_DOMAIN } from '../config';
import './AvailableReservationsPage.css';

export default function AvailableReservationsPage() {
  const { user } = useAuth();
  const userId = user?.userid;
  const token  = user?.accessToken;

  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    if (!token) return setError('尚未登入');
    setLoading(true);

    // 1) fetch court-based + custom in parallel
    Promise.all([
      fetch(`${API_DOMAIN}/reservations/available`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.ok ? r.json() : Promise.reject(r.status)),
      fetch(`${API_DOMAIN}/custom-reservations/available`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.ok ? r.json() : Promise.reject(r.status)),
    ])
    .then(([courtData, customData]) => {
      // 2) normalize shape
      const normalized = [
        // court-based
        ...courtData.map(r => ({
          id:            r.id,
          type:          'court',
          venueName:     r.court.venue.name,
          courtName:     r.court.name,
          address:       null,
          applicant:     r.applicant,
          start_ts:      r.start_ts,
          end_ts:        r.end_ts,
          num_players:   r.num_players,
          currentPlayers:r.currentPlayers,
          visibility:    r.visibility,
          requests:      r.requests || []
        })),
        // custom
        ...customData.map(r => ({
          id:            r.id,
          type:          'custom',
          venueName:     r.venue_name,
          courtName:     r.court_name,
          address:       r.address,
          applicant:     r.applicant,
          start_ts:      r.start_ts,
          end_ts:        r.end_ts,
          num_players:   r.num_players,
          currentPlayers:r.currentPlayers,
          visibility:    r.visibility,
          requests:      r.requests || []
        }))
      ];
      // 3) annotate userStatus & sort by start_ts
      const annotated = normalized.map(r => {
        const myReq = r.requests.find(j => j.user_id === userId);
        return {
          ...r,
          userStatus: myReq ? myReq.status : 'none'
        };
      }).sort((a,b) => new Date(a.start_ts) - new Date(b.start_ts));
      setItems(annotated);
    })
    .catch(e => setError(`載入失敗：${e}`))
    .finally(() => setLoading(false));
  }, [token, userId]);

  // unified join handler
  const handleJoin = async (item) => {
    const url = item.type === 'court'
      ? `${API_DOMAIN}/reservations/${item.id}/join-requests`
      : `${API_DOMAIN}/custom-reservations/${item.id}/join-requests`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 409 || res.ok) {
        // mark pending
        setItems(xs => xs.map(x =>
          x.id === item.id ? { ...x, userStatus: 'pending' } : x
        ));
      } else {
        throw new Error(res.status);
      }
    } catch (err) {
      alert(`申請失敗：${err}`);
    }
  };

  if (loading) return <p>載入中…</p>;
  if (error)   return <p className="error">{error}</p>;

  return (
    <div className="avail-res-page">
      <h2>可預約場次</h2>
      <table className="avail-res-table">
        <thead>
          <tr>
            <th>場地</th>
            <th>球場</th>
            <th>地址</th>
            <th>發起者</th>
            <th>時段</th>
            <th>名額</th>
            <th>已加入</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => {
            const { id, type,
                    venueName, courtName, address,
                    applicant, start_ts, end_ts,
                    num_players, currentPlayers,
                    userStatus
                  } = item;
            const label = `${applicant.lastname} ${applicant.firstname}${applicant.nickname?` (${applicant.nickname})`:''}`;
            const isFull = currentPlayers >= num_players;

            let actionNode;
            if (userStatus === 'pending') {
              actionNode = <button disabled className="btn-pending">已申請</button>;
            } else if (userStatus === 'rejected') {
              actionNode = <button disabled className="btn-rejected">被拒絕</button>;
            } else if (userStatus === 'approved') {
              actionNode = <span className="joined">已加入</span>;
            } else if (isFull) {
              actionNode = <span className="full">額滿</span>;
            } else {
              actionNode = (
                <button className="btn-join" onClick={() => handleJoin(item)}>
                  申請加入
                </button>
              );
            }

            return (
              <tr key={`${type}-${id}`}>
                <td>{venueName}</td>
                <td>{courtName}</td>
                <td>{address || '—'}</td>
                <td>{label}</td>
                <td>
                  {new Date(start_ts).toLocaleString()}<br/>
                  {new Date(end_ts).toLocaleString()}
                </td>
                <td>{num_players}</td>
                <td>{currentPlayers}/{num_players}</td>
                <td>{actionNode}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
