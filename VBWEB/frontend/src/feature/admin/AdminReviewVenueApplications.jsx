// src/pages/admin/AdminReviewVenueApplications.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_DOMAIN } from '../../config';
import { useNavigate } from 'react-router-dom';
import './AdminReviewVenueApplications.css';

export default function AdminReviewApplications() {
  const { user } = useAuth();
  const token = user?.accessToken;
  const navigate = useNavigate();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // check admin
  useEffect(() => {
    if (!token) return;
    fetch(`${API_DOMAIN}/user/isadmin`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (!data) {
          alert('你並沒有管理員權限');
          navigate('/');
        }
      })
      .catch(() => navigate('/'));
  }, [token, navigate]);

  // load applications
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(`${API_DOMAIN}/maintainer_applications`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then(data => setApps(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [token]);

  if (!token)   return <p className="center-message">請先登入</p>;
  if (loading)  return <p className="center-message">讀取中…</p>;
  if (error)    return <p className="center-message error">載入錯誤：{error}</p>;

  return (
    <div className="admin-review-page">
      <h2>待審核申請清單</h2>
      <table className="admin-review-table">
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
          {apps.length === 0 ? (
            <tr>
              <td colSpan={5} className="no-data">
                暫無申請
              </td>
            </tr>
          ) : (
            apps.map(app => (
              <tr key={app.id}>
                <td>{app.user_id}</td>
                <td>{app.venue_name}</td>
                <td>{app.address}</td>
                <td>{app.phone}</td>
                <td>
                  <button
                    onClick={() => navigate(`/admin-review-applications/${app.id}`)}
                    className="button-ops"
                  >
                    詳細
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
