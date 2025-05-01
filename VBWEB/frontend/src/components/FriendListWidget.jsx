// src/components/FriendListWidget.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getFriends,
  sendFriendRequest,
  getPendingRequests,
  respondFriendRequest
} from '../api/friends';
import ChatWindow from './ChatWindow.jsx';
import './FriendListWidget.css';
import { API_DOMAIN } from '../config.js';

export default function FriendListWidget() {
  const { user, isAuthLoaded } = useAuth();
  const token = user?.accessToken;
  const userId = user?.userID;

  const [isOpen, setIsOpen] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [friends, setFriends] = useState([]);
  const [pending, setPending] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [activeChatPartner, setActiveChatPartner] = useState(null);

  const containerRef = useRef(null);

  // load friends & pending when opened
  useEffect(() => {
    if (isOpen && userId) {
      getFriends(userId).then(setFriends).catch(e => setError(e.message));
      getPendingRequests(userId).then(setPending).catch(console.error);
    }
  }, [isOpen, userId]);

  // click outside to close
  useEffect(() => {
    const handleClickOutside = e => {
      if (isOpen && containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveChatPartner(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const sendInvite = async () => {
    try {
      const res = await sendFriendRequest(userId, inviteEmail);
      setMsg(res.message);
      setInviteEmail('');
      const p = await getPendingRequests(userId);
      setPending(p);
    } catch (e) {
      setError(e.message);
    }
  };

  const openChat = async friend => {
    if (!token) return;
    try {
      const res = await fetch(
        `${API_DOMAIN}/chats/private/${friend.userid}`,
        { method: 'GET', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) {
        console.error('openChat failed', await res.json());
        return;
      }
      const chat = await res.json();
      setActiveChatPartner({
        id: chat.id,
        name: `${friend.firstname} ${friend.lastname}`
      });
    } catch (e) {
      console.error(e);
    }
  };

  if (!isAuthLoaded || !userId) return null;

  return (
    <div ref={containerRef} className="friend-widget-container">
      <button
        className="friend-toggle-button"
        onClick={() => {
          setIsOpen(o => !o);
          setActiveChatPartner(null);
        }}
      >
        {isOpen ? 'Close Friends' : 'Open Friends'}
      </button>

      {isOpen && (
        <div className="chat-widget-container">
          <aside className="chat-sidebar">
            <div className="chat-search">
              <input placeholder="搜尋名稱" />
              <button
                className="pending-btn"
                onClick={() => setShowPending(p => !p)}
              >
                🔔{pending.length > 0 && <span className="pending-badge">{pending.length}</span>}
              </button>
            </div>

            <div className="invite-panel">
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="輸入 Email 發送邀請"
              />
              <button onClick={sendInvite}>Send</button>
            </div>

            {error && <div className="msg error">{error}</div>}
            {msg   && <div className="msg success">{msg}</div>}

            <ul className="chat-list">
              {friends.map(f => (
                <li
                  key={f.userid}
                  className="chat-list-item"
                  onClick={() => openChat(f)}
                >
                  <img
                    className="chat-avatar"
                    src={f.photo || '/default-avatar.png'}
                    alt="avatar"
                  />
                  <div className="chat-info">
                    <div className="chat-name">{f.firstname} {f.lastname}</div>
                    <div className="chat-snippet">{f.gmail}</div>
                  </div>
                  {f.unreadCount > 0 && (
                    <span className="chat-badge">{f.unreadCount}</span>
                  )}
                </li>
              ))}
            </ul>

            {showPending && (
              <div className="pending-section">
                <h4>Pending Requests</h4>
                {pending.length > 0 ? (
                  <ul className="chat-list">
                    {pending.map(req => (
                      <li key={req.userid} className="chat-list-item">
                        <div className="chat-info">
                          {req.firstname} {req.lastname} ({req.gmail})
                        </div>
                        <div className="action-btns">
                          <button
                            onClick={async () => {
                              await respondFriendRequest(userId, req.userid, true);
                              const p = await getPendingRequests(userId);
                              setPending(p);
                            }}
                          >
                            Accept
                          </button>
                          <button
                            onClick={async () => {
                              await respondFriendRequest(userId, req.userid, false);
                              const p = await getPendingRequests(userId);
                              setPending(p);
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
            {activeChatPartner ? (
              <ChatWindow
                chatId={activeChatPartner.id}
                partnerName={activeChatPartner.name}
                onClose={() => setActiveChatPartner(null)}
              />
            ) : (
              <div className="chat-placeholder">
                <img src="/welcome-illustration.png" alt="歡迎" />
                <h3>歡迎使用聊聊</h3>
                <p>點擊左側好友開啟聊天</p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
