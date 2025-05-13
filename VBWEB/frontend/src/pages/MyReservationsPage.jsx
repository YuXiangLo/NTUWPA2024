import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_DOMAIN } from '../config';
import { Link } from 'react-router-dom';
import './MyReservationsPage.css';

export default function MyReservationsPage() {
  const { user } = useAuth();
  const token = user?.accessToken;

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_DOMAIN}/reservations/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then(data => setReservations(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p>載入中…</p>;
  if (error)   return <p className="error">錯誤：{error}</p>;

  return (
    <div className="my-res-page">
      <h2>我的預約</h2>

      {reservations.length === 0 ? (
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
            {reservations.map(r => (
              <tr key={r.id}>
                <td>{r.court.venue.name}</td>
                <td>{r.court.name}</td>
                <td>
                  {new Date(r.start_ts).toLocaleString()}
                  <br/>
                  {new Date(r.end_ts).toLocaleString()}
                </td>
                <td>{r.status}</td>
                <td>
                  {r.status === 'approved' && (
                    <Link
                      to={`/reservations/${r.id}/manage-join-requests`}
                      className="btn-manage"
                    >
                      管理加入請求
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
