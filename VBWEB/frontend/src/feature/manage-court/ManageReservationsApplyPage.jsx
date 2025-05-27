import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_DOMAIN } from '../../config';
import './ManageReservationsApplyPage.css';

export default function ManageReservationsApplyPage() {
  const { courtId } = useParams();
  const { user } = useAuth();
  const token = user?.accessToken;

  const [requests, setRequests] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_DOMAIN}/courts/${courtId}/reservations`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then(data => setRequests(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [courtId, token]);

  const handleAction = async (id, action) => {
    const url = `${API_DOMAIN}/reservations/${id}/${action}`;
    const opts = {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    };
    if (action === 'reject') {
      const reason = prompt('請輸入拒絕原因：');
      if (reason === null) return;
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify({ rejectionReason: reason });
    }
    try {
      const res = await fetch(url, opts);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setRequests(r => r.filter(req => req.id !== id));
    } catch (err) {
      alert(`操作失敗：${err.message}`);
    }
    window.location.reload();
  };

  if (loading) return <p className="center-message">載入中…</p>;
  if (error)   return <p className="center-message error">錯誤：{error}</p>;

  return (
    <div className="manage-res-page">
      <h2>管理預約申請</h2>

      {requests.length === 0 ? (
        <table className="res-table">
          <thead>
            <tr>
              <th>申請者</th>
              <th>時段</th>
              <th>人數</th>
              <th>費用</th>
              <th>可見性</th>
              <th>說明</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={8} className="no-data">
                目前沒有任何預約申請。
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <table className="res-table">
          <thead>
            <tr>
              <th>申請者</th>
              <th>時段</th>
              <th>人數</th>
              <th>費用</th>
              <th>可見性</th>
              <th>說明</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(req => (
              <tr key={req.id}>
                <td>
                  {req.applicant.lastname} {req.applicant.firstname}
                  {req.applicant.nickname && ` (${req.applicant.nickname})`}
                </td>
                <td>
                  {new Date(req.start_ts).toLocaleString()}<br/>
                  {new Date(req.end_ts).toLocaleString()}
                </td>
                <td>{req.num_players}</td>
                <td>{req.fee ?? '免費'}</td>
                <td>{req.visibility}</td>
                <td>{req.detail || '—'}</td>
                <td>
                  <span className={`status-${req.status}`}>
                    {req.status === 'pending' ? '審核中' : req.status === 'approved' ? '已通過' : '已拒絕'}
                  </span>
                </td>
                <td className="btn-group">
                  {req.status === 'pending' && (
                    <>
                      <button
                        className="button-ops-approve"
                        onClick={() => handleAction(req.id, 'approve')}
                      >
                        批准
                      </button>
                      <button
                        className="button-ops-reject"
                        onClick={() => handleAction(req.id, 'reject')}
                      >
                        拒絕
                      </button>
                    </>
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
