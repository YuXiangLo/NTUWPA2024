// FriendListWidget.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getFriends,
  sendFriendRequest,
  getPendingRequests,
  respondFriendRequest
} from '../api/friends';
import './FriendListWidget.css';

const FriendListWidget = () => {
  const { user, isAuthLoaded } = useAuth();
  const userId = user?.userID;

  const [isOpen, setIsOpen] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadFriends = async () => {
    try {
      const data = await getFriends(userId);
      setFriends(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const loadPending = async () => {
    try {
      const data = await getPendingRequests(userId);
      setPendingRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isOpen && userId) {
      loadFriends();
      loadPending();
    }
  }, [isOpen, userId]);

  const handleSendRequest = async () => {
    try {
      const res = await sendFriendRequest(userId, newEmail);
      setMessage(res.message);
      setNewEmail('');
      loadPending();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isAuthLoaded || !userId) return null;

  return (
    <div className="friend-widget-container">
      <button
        className="friend-toggle-button"
        onClick={() => setIsOpen(open => !open)}
      >
        {isOpen ? 'Close Friends' : 'Open Friends'}
      </button>

      {isOpen && (
        <div className="chat-widget-container">
          <aside className="chat-sidebar">
            <div className="chat-search">
              <input type="text" placeholder="搜尋名稱" />
              <button
                className="pending-btn"
                onClick={() => setShowPending(p => !p)}
              >
                🔔
                {pendingRequests.length > 0 && (
                  <span className="pending-badge">
                    {pendingRequests.length}
                  </span>
                )}
              </button>
            </div>

            <div className="invite-panel">
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="輸入 Email 發送邀請"
              />
              <button onClick={handleSendRequest}>Send</button>
            </div>

            {error && <div className="msg error">{error}</div>}
            {message && <div className="msg success">{message}</div>}

            <ul className="chat-list">
              {friends.map(f => (
                <li key={f.userid} className="chat-list-item">
                  <img
                    className="chat-avatar"
                    src={f.avatarUrl || '/default-avatar.png'}
                    alt="avatar"
                  />
                  <div className="chat-info">
                    <div className="chat-name">
                      {f.firstname} {f.lastname}
                    </div>
                    <div className="chat-snippet">{f.gmail}</div>
                  </div>
                  <div className="chat-meta">
                    <span className="chat-date">—</span>
                    {f.unreadCount > 0 && (
                      <span className="chat-badge">{f.unreadCount}</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {showPending && (
              <div className="pending-section">
                <h4>Pending Requests</h4>
                {pendingRequests.length > 0 ? (
                  <ul className="chat-list">
                    {pendingRequests.map(req => (
                      <li key={req.userid} className="chat-list-item">
                        <div className="chat-info">
                          {req.firstname} {req.lastname} ({req.gmail})
                        </div>
                        <div className="action-btns">
                          <button
                            onClick={async () => {
                              await respondFriendRequest(
                                userId,
                                req.userid,
                                true
                              );
                              await loadFriends();
                              await loadPending();
                            }}
                          >
                            Accept
                          </button>
                          <button
                            onClick={async () => {
                              await respondFriendRequest(
                                userId,
                                req.userid,
                                false
                              );
                              await loadPending();
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="no-requests">No pending requests.</div>
                )}
              </div>
            )}
          </aside>

          <section className="chat-content">
            <div className="chat-placeholder">
              <img src="/welcome-illustration.png" alt="歡迎" />
              <h3>歡迎使用聊聊</h3>
              <p>現在就開始聊天吧！</p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default FriendListWidget;
