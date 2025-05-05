// src/components/FriendListWidget.jsx
import React, { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
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
  const [chats, setChats] = useState([]);       // fields: id, partner_name, partner_photo, last_message_at, unread_count
  const [pending, setPending] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [activeChat, setActiveChat] = useState(null);

  const socketRef = useRef(null);
  const containerRef = useRef(null);

  // helper to load chats
  const loadChats = async () => {
    try {
      const res = await fetch(`${API_DOMAIN}/chats`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to load chats');
      setChats(await res.json());
    } catch (e) {
      console.error(e);
      setError(e.message);
    }
  };

  // load chats & pending when widget opens
  useEffect(() => {
    if (isOpen && userId) {
      loadChats();
      getPendingRequests(userId).then(setPending).catch(console.error);
    }
  }, [isOpen, userId]);

  // establish socket when open
  useEffect(() => {
    if (!isOpen || !token) return;
    const sock = io(API_DOMAIN, { auth: { token } });
    socketRef.current = sock;
    return () => {
      sock.disconnect();
      socketRef.current = null;
    };
  }, [isOpen, token]);

  // join rooms & listen for incoming messages
  useEffect(() => {
    const sock = socketRef.current;
    if (!sock) return;
    // join each chat room
    chats.forEach(chat => {
      sock.emit('joinChat', { chatId: chat.id });
    });
    // handle new messages
    const handleNew = msg => {
      if (msg.sender_id === userId) return; // ignore own
      setChats(prev =>
        prev.map(c => {
          if (c.id === msg.chat_id) {
            const isActive = activeChat?.id === c.id;
            return {
              ...c,
              last_message_at: msg.created_at,
              unread_count: isActive ? c.unread_count : c.unread_count + 1
            };
          }
          return c;
        })
      );
    };
    sock.on('newMessage', handleNew);
    return () => {
      sock.off('newMessage', handleNew);
    };
  }, [chats, activeChat, userId]);

  // click outside to close
  useEffect(() => {
    const onClick = e => {
      if (isOpen && containerRef.current && !containerRef.current.contains(e.target)) {
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
    // mark as read server‐side
    await fetch(`${API_DOMAIN}/chats/${chat.id}/read`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    // reload chats to clear badge
    await loadChats();
  };

  if (!isAuthLoaded || !userId) return null;

  // sort: unread first, then by last_message_at desc
  const sorted = [...chats].sort((a, b) => {
    if (b.unread_count !== a.unread_count) {
      return b.unread_count - a.unread_count;
    }
    return Date.parse(b.last_message_at || '') - Date.parse(a.last_message_at || '');
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
              <button className="pending-btn" onClick={() => setShowPending(p => !p)}>
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
              {sorted.map(chat => {
                let timeLabel = '—';
                if (chat.last_message_at) {
                  const d = new Date(chat.last_message_at);
                  if (!isNaN(d.getTime())) {
                    timeLabel = d.toLocaleTimeString('zh-TW', {
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
                          <button onClick={async () => {
                            await respondFriendRequest(userId, req.userid, true);
                            await loadChats();
                            setPending(await getPendingRequests(userId));
                          }}>Accept</button>
                          <button onClick={async () => {
                            await respondFriendRequest(userId, req.userid, false);
                            setPending(await getPendingRequests(userId));
                          }}>Reject</button>
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
