// src/components/FriendListWidget.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getPendingRequests,
  sendFriendRequest,
  respondFriendRequest
} from '../api/friends';
import ChatWindow from './ChatWindow.jsx';
import './FriendListWidget.css';
import { API_DOMAIN } from '../config.js';

export default function FriendListWidget() {
  const { user, isAuthLoaded } = useAuth();
  const token  = user?.accessToken;
  const userId = user?.userID;

  const [isOpen, setIsOpen] = useState(false);
  const [showPending, setShowPending] = useState(false);
  const [chats, setChats] = useState([]);       // expects fields including lastMessageAt, unreadCount
  const [pending, setPending] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [activeChat, setActiveChat] = useState(null);

  const containerRef = useRef(null);

  // load /chats and pending when opened
  useEffect(() => {
    if (isOpen && userId) {
      fetch(`${API_DOMAIN}/chats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => {
          if (!r.ok) throw r;
          return r.json();
        })
        .then(setChats)
        .catch(e => {
          console.error(e);
          setError(typeof e.json === 'function' ? e.json() : e.message);
        });

      getPendingRequests(userId)
        .then(setPending)
        .catch(console.error);
    }
  }, [isOpen, userId, token]);

  // click outside to close
  useEffect(() => {
    const onClick = e => {
      if (
        isOpen &&
        containerRef.current &&
        !containerRef.current.contains(e.target)
      ) {
        setIsOpen(false);
        setActiveChat(null);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [isOpen]);

  const sendInvite = async () => {
    try {
      const res = await sendFriendRequest(userId, inviteEmail);
      setMsg(res.message);
      setInviteEmail('');
      setPending(await getPendingRequests(userId));
    } catch (e) {
      setError(e.message);
    }
  };

  const openChat = async chat => {
    setActiveChat(chat);
    // mark as read
    await fetch(`${API_DOMAIN}/chats/${chat.id}/read`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    // reload chats to update badges
    const r2 = await fetch(`${API_DOMAIN}/chats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const updated = await r2.json();
    setChats(updated);
  };

  if (!isAuthLoaded || !userId) return null;

  // sort unread first, then by lastMessageAt desc
  const sorted = [...chats].sort((a, b) => {
    if (b.unreadCount !== a.unreadCount) {
      return b.unreadCount - a.unreadCount;
    }
    return new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime();
  });

  return (
    <div ref={containerRef} className="friend-widget-container">
      <button
        className="friend-toggle-button"
        onClick={() => { setIsOpen(o => !o); setActiveChat(null); }}
      >
        {isOpen ? 'Close Chats' : 'Open Chats'}
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
                🔔
                {pending.length > 0 && (
                  <span className="pending-badge">{pending.length}</span>
                )}
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
              {sorted.map(chat => {
                // parse date safely
                console.log(chat);
                let timeLabel = '—';
                if (chat.last_message_at) {
                  const date = new Date(chat.last_message_at);

                  if (!isNaN(date.getTime())) {
                    timeLabel = date.toLocaleTimeString('zh-TW', {
                      hour: '2-digit',
                      minute: '2-digit'
                    });
                  }
                }
                return (
                  <li
                    key={chat.id}
                    className="chat-list-item"
                    onClick={() => openChat(chat)}
                  >
                    <img
                      className="chat-avatar"
                      src={chat.partner_photo || '/default-avatar.png'}
                      alt=""
                    />
                    <div className="chat-info">
                      <div className="chat-name">{chat.partner_name}</div>
                      <div className="chat-snippet">{timeLabel}</div>
                    </div>
                    {chat.unread_count > 0 && (
                      <span className="chat-badge">{chat.unread_count}</span>
                    )}
                  </li>
                );
              })}
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
                              setChats(await fetch(`${API_DOMAIN}/chats`, {
                                headers: { 'Authorization': `Bearer ${token}` }
                              }).then(r=>r.json()));
                              setPending(await getPendingRequests(userId));
                            }}
                          >
                            Accept
                          </button>
                          <button
                            onClick={async () => {
                              await respondFriendRequest(userId, req.userid, false);
                              setPending(await getPendingRequests(userId));
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
            {activeChat ? (
              <ChatWindow
                chatId={activeChat.id}
                partnerName={activeChat.partner_name}
                onClose={() => setActiveChat(null)}
              />
            ) : (
              <div className="chat-placeholder">
                <img src="/welcome-illustration.png" alt="歡迎" />
                <h3>歡迎使用聊聊</h3>
                <p>點擊左側聊天列表開啟對話</p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
