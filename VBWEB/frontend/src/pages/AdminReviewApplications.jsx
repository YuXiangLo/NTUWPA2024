// src/pages/AdminReviewApplications.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AdminReviewApplications.css';
import { API_DOMAIN } from '../config';

export default function AdminReviewApplications() {
  const { user } = useAuth();
  const token = user?.accessToken;
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchList = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetch(`${API_DOMAIN}/maintainer_applications`, {
          method: 'GET',
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const data = await res.json();
        setApps(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchList();
  }, [token]);

  if (!token) return <p>請先登入</p>;
  if (loading) return <p>讀取中…</p>;
  if (error) return <p className="error">載入錯誤：{error}</p>;

  return (
    <div className="admin-review-list">
      <h2>待審核申請清單</h2>
      <table>
        <thead>
          <tr>
            <th>申請者</th>
            <th>場地名稱</th>
            <th>地址</th>
            <th>電話</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {apps.map(app => (
            <tr key={app.id}>
              <td>{app.user_id}</td>
              <td>{app.venue_name}</td>
              <td>{app.address}</td>
              <td>{app.phone}</td>
              <td><Link className="detail-button" to={`/admin-review-applications/${app.id}`}>詳細</Link></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
