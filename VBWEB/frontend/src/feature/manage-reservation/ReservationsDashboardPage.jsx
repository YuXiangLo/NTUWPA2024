import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { API_DOMAIN } from '../../config';
import { Link } from 'react-router-dom';
import './ReservationsDashboardPage.css';

export default function ReservationsDashboardPage() {
  const { user } = useAuth();
  const userId = user?.userid;
  const token  = user?.accessToken;

  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    if (!token) return setError('尚未登入');
    setLoading(true);

    Promise.all([
      fetch(`${API_DOMAIN}/reservations/my`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.ok ? r.json() : Promise.reject(r.status)),
      fetch(`${API_DOMAIN}/custom-reservations/my`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.ok ? r.json() : Promise.reject(r.status)),
    ])
      .then(([courtData, customData]) => {
        const normalized = [
          ...courtData.map(r => ({
            id:          r.id,
            type:        'court',
            venueName:   r.court.venue.name,
            courtName:   r.court.name,
            start_ts:    r.start_ts,
            end_ts:      r.end_ts,
            status:      r.status
          })),
          ...customData.map(r => {
            console.log(r);
            return({
            id:          r.id,
            type:        'custom',
            venueName:   r.reservation.venue_name,
            courtName:   r.reservation.court_name,
            start_ts:    r.reservation.start_ts,
            end_ts:      r.reservation.end_ts,
            status:      r.status
          })})
        ];
        // sort by time
        setItems(normalized.sort((a,b)=>new Date(a.start_ts)-new Date(b.start_ts)));
      })
      .catch(e => setError(`載入失敗：${e}`))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p>載入中…</p>;
  if (error)   return <p className="error">{error}</p>;

  return (
    <div className="my-res-page">
      <h2>我的預約</h2>
      {items.length === 0 ? (
        <p>目前沒有任何預約。</p>
      ) : (
        <table className="my-res-table">
          <thead>
            <tr>
              <th>場地</th>
              <th>球場</th>
              <th>時段</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {items.map(r => {
              console.log(r);
              return (
              <tr key={`${r.type}-${r.id}`}>
                <td>{r.venueName}</td>
                <td>{r.courtName}</td>
                <td>
                  {new Date(r.start_ts).toLocaleString()}<br/>
                  {new Date(r.end_ts).toLocaleString()}
                </td>
                <td>{r.status}</td>
                <td>
                  {r.status === 'approved' ? (
                    r.type === 'court' ? (
                      <Link
                        to={`/reservations/${r.id}/join-requests`}
                        className="btn-manage"
                      >
                        管理預約
                      </Link>
                    ) : (
                      <Link
                        to={`/custom-reservations/${r.id}/join-requests`}
                        className="btn-manage"
                      >
                        管理預約
                      </Link>
                    )
                  ) : (
                    <em>—</em>
                  )}
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      )}
    </div>
  );
}