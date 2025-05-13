import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './ManageCourts.css';
import { API_DOMAIN } from '../config';

export default function ManageCourts() {
  const { venueId } = useParams();
  const { user } = useAuth();
  const token = user?.accessToken;
  const navigate = useNavigate();

  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch(`${API_DOMAIN}/venues/${venueId}/courts`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then(data => setCourts(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token, venueId]);

  const handleDelete = async courtId => {
    if (!window.confirm('確定要刪除此球場？')) return;
    try {
      const res = await fetch(
        `${API_DOMAIN}/venues/${venueId}/courts/${courtId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Error ${res.status}`);
      setCourts(prev => prev.filter(c => c.id !== courtId));
    } catch (err) {
      alert(`刪除失敗：${err.message}`);
    }
  };

  if (!token)   return <p>請先登入。</p>;
  if (loading)  return <p>載入中…</p>;
  if (error)    return <p className="error">錯誤：{error}</p>;

  return (
    <div className="manage-courts">
      <h2>管理球場</h2>
      <Link to={`/venues/${venueId}/courts/new`} className="btn-add-court">
        新增球場
      </Link>

      {courts.length === 0 ? (
        <p>尚未新增任何球場。</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>名稱</th>
              <th>屬性</th>
              <th>說明</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {courts.map(c => (
              <tr key={c.id}>
                <td>{c.name}</td>
                <td>{c.property || '—'}</td>
                <td>{c.detail || '—'}</td>
                <td>
                  <button
                    className="btn-maintain"
                    onClick={() => navigate(`/venues/${venueId}/courts/${c.id}/manage-schedule`)}
                  >
                    維護時段
                  </button>
                  <button
                    className="btn-maintain"
                    onClick={() => navigate(`/venues/${venueId}/courts/${c.id}/reservations`)}
                  >
                    管理預約申請
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(c.id)}
                  >
                    刪除
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
