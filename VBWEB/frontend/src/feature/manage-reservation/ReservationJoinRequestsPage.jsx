// src/pages/ReservationJoinRequestsPage.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_DOMAIN } from '../../config';
import './ReservationJoinRequestsPage.css';

export default function ReservationJoinRequestsPage() {
  const { type, reservationId } = useParams();
  const { user } = useAuth();
  const token = user?.accessToken;
  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  const baseUrl = `${API_DOMAIN}/${type}/${reservationId}/join-requests`;
  const actionBase = type === 'reservations'
    ? `${API_DOMAIN}/join-requests`
    : `${API_DOMAIN}/custom-reservations/join-requests`;

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(baseUrl, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then(data => setRequests(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [baseUrl, token]);

  const handleAction = async (id, action) => {
    const url = `${actionBase}/${id}/${action}`;
    const opts = { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } };

    if (action === 'reject') {
      const reason = prompt('請輸入拒絕原因：');
      if (reason === null) return;
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify({ rejectionReason: reason });
    }

    try {
      const res = await fetch(url, opts);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const updated = await res.json();
      setRequests(rs => rs.map(r => r.id === id ? updated : r));
    } catch (err) {
      alert(`操作失敗：${err.message}`);
    }
    window.location.reload();
  };

  if (loading) return <p className="center-message">載入中…</p>;
  if (error)   return <p className="center-message error">錯誤：{error}</p>;

  return (
    <div className="join-req-page">
      <h2>管理加入請求</h2>

      {requests.length === 0 ? (
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
            <tr>
              <td colSpan={4} className="no-data">
                目前沒有加入請求。
              </td>
            </tr>
          </tbody>
        </table>
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
              const a = req.applicant || {};
              const label = `${a.lastname || ''} ${a.firstname || ''}` +
                            (a.nickname ? ` (${a.nickname})` : '');
              return (
                <tr key={req.id}>
                  <td>{label}</td>
                  <td>{new Date(req.requested_at).toLocaleString()}</td>
                  <td>
                    <span className={`status-${req.status}`}>
                      {req.status === 'pending' ? '審核中'
                        : req.status === 'approved' ? '已通過'
                        : '已拒絕'}
                    </span>
                  </td>
                  <td className="btn-group">
                    {req.status === 'pending' ? (
                      <>
                        <button
                          className="button-ops button-ops-approve"
                          onClick={() => handleAction(req.id, 'approve')}
                        >
                          批准
                        </button>
                        <button
                          className="button-ops button-ops-reject"
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

      <button
        className="button-ops"
        onClick={() => navigate(-1)}
      >
        ← 返回
      </button>
    </div>
  );
}
