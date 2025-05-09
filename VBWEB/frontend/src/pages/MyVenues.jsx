import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './MyVenues.css';
import { API_DOMAIN } from '../config';

export default function MyVenues() {
  const { user } = useAuth();
  const token = user?.accessToken;
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch(`${API_DOMAIN}/venues/my`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then(setVenues)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token)   return <p>請先登入才能查看「我的場地」。</p>;
  if (loading)  return <p>載入中…</p>;
  if (error)    return <p className="error">錯誤：{error}</p>;

  return (
    <div className="my-venues">
      <h2>我的場地管理</h2>
      {venues.length === 0 ? (
        <p>目前沒有任何場地申請或已核准場地。</p>
      ) : (
        <table>
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
                <td className={v.status === 'pending' ? 'status-pending' : 'status-approved'}>
                  {v.status}
                </td>
                <td>
                  {v.status === 'approved' ? (
                    <Link to={`/venues/${v.id}/courts`} className="btn-manage-courts">
                      管理球場
                    </Link>
                  ) : (
                    <span className="text-muted">審核中</span>
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
