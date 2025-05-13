// src/pages/ReservationJoinRequestsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_DOMAIN } from '../config';
import './ReservationJoinRequestsPage.css';

export default function ReservationJoinRequestsPage() {
  const { reservationId } = useParams();
  const { user } = useAuth();
  const token = user?.accessToken;
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  // Load all join-requests for this reservation
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_DOMAIN}/reservations/${reservationId}/join-requests`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then(data => setRequests(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [reservationId, token]);

  // Approve or reject a join request
  const handleAction = async (id, action) => {
    const url = `${API_DOMAIN}/join-requests/${id}/${action}`;
    const opts = {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    };

    if (action === 'reject') {
      const reason = prompt('請輸入拒絕原因：');
      if (reason === null) return; // cancelled
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify({ rejectionReason: reason });
    }

    try {
      const res = await fetch(url, opts);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const updated = await res.json();
      // update local state
      setRequests(rs =>
        rs.map(r => r.id === id ? updated : r)
      );
    } catch (err) {
      alert(`操作失敗：${err.message}`);
    }
  };

  if (loading) return <p>載入中…</p>;
  if (error)   return <p className="error">錯誤：{error}</p>;
  console.log(requests);
  return (
    <div className="join-req-page">
      <h2>管理加入請求</h2>
      {requests.length === 0 ? (
        <p>目前沒有加入請求。</p>
      ) : (
        <table className="join-req-table">
          <thead>
            <tr>
              <th>申請者</th>
              <th>請求時間</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => {
              const appl = req.applicant || {};
              const label = `${appl.lastname || ''} ${appl.firstname || ''}` +
                            (appl.nickname ? ` (${appl.nickname})` : '');
              return (
                <tr key={req.id}>
                  <td>{label}</td>
                  <td>{new Date(req.requested_at).toLocaleString()}</td>
                  <td>{req.status}</td>
                  <td>
                    {req.status === 'pending' ? (
                      <>
                        <button
                          className="btn-approve"
                          onClick={() => handleAction(req.id, 'approve')}
                        >
                          批准
                        </button>
                        <button
                          className="btn-reject"
                          onClick={() => handleAction(req.id, 'reject')}
                        >
                          拒絕
                        </button>
                      </>
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
      <button className="btn-back" onClick={() => navigate(-1)}>
        ← 返回
      </button>
    </div>
  );
}
