import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { API_DOMAIN } from '../../config';
import './MyVenues.css';

export default function MyVenues() {
  const { user } = useAuth();
  const token = user?.accessToken;
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    fetch(`${API_DOMAIN}/venues/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then(data => setVenues(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token)   return <p className="center-message">請先登入才能查看「我的場地」。</p>;
  if (loading)  return <p className="center-message">載入中…</p>;
  if (error)    return <p className="center-message error">錯誤：{error}</p>;

  return (
    <div className="my-venues">
      <h2>我的場地管理</h2>

      <div className="actions">
        <button onClick={() => navigate(`/venue-application`)} className="button-ops">
          新增場地
        </button>
      </div>

      {venues.length === 0 ? (
        <table className="my-venues-table">
          <thead>
            <tr>
              <th>場地名稱</th>
              <th>球場數量</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={4} className="no-data">
                目前沒有任何場地申請或已核准場地。
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <table className="my-venues-table">
          <thead>
            <tr>
              <th>場地名稱</th>
              <th>球場數量</th>
              <th>狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {venues.map(v => (
              <tr key={v.id}>
                <td>{v.name}</td>
                <td>{v.courtCount}</td>
                <td>
                  <span className={v.status === 'pending' ? 'status-pending' : 'status-approved'}>
                    {v.status === 'pending' ? '審核中' : '已核准'}
                  </span>
                </td>
                <td>
                  {v.status === 'approved' ? (
                    <button onClick={() => navigate(`/venues/${v.id}/courts`)} className="button-ops">
                      管理球場
                    </button>
                  ) : (
                    <span className="text-muted">—</span>
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
