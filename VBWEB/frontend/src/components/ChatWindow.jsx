// src/components/ChatWindow.jsx
import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { API_DOMAIN } from '../config.js';
import { useAuth } from '../context/AuthContext.jsx';
import './ChatWindow.css';

export default function ChatWindow({ chatId, partnerName, onClose }) {
  const { user } = useAuth();
  const token = user?.accessToken;
  const userId = user?.userID;

  const [socket, setSocket] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const endRef = useRef();

  const dedupe = arr => {
    const seen = new Set();
    return arr.filter(m => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  };

  // join & load history & listen
  useEffect(() => {
    if (!chatId || !token) return;

    const sock = io(API_DOMAIN, { auth: { token } });
    setSocket(sock);
    sock.emit('joinChat', { chatId });

    fetch(`${API_DOMAIN}/chats/${chatId}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => setMsgs(dedupe(data)))
      .catch(console.error);

    sock.on('newMessage', m => {
      setMsgs(prev => dedupe([...prev, m]));
    });

    // also mark read when opening
    fetch(`${API_DOMAIN}/chats/${chatId}/read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(console.error);

    return () => {
      sock.disconnect();
      setSocket(null);
    };
  }, [chatId, token]);

  // scroll on new messages
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  const sendMessage = () => {
    if (!socket || !input.trim()) return;

    // optimistic
    const tmpId = `tmp-${Date.now()}`;
    const local = {
      id: tmpId,
      chat_id: chatId,
      sender_id: userId,
      content: input,
      created_at: new Date().toISOString(),
    };
    setMsgs(prev => [...prev, local]);

    socket.emit('sendMessage', { chatId, content: input }, saved => {
      setMsgs(prev =>
        dedupe(prev.map(m => (m.id === tmpId ? saved : m)))
      );
    });

    // clear input
    setInput('');

    // mark this chat as read on the server
    fetch(`${API_DOMAIN}/chats/${chatId}/read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(console.error);
  };

  // group by date...
  const grouped = [];
  let lastDate = '';
  msgs.forEach(m => {
    const d = new Date(m.created_at).toLocaleDateString('zh-TW', {
      month: 'numeric',
      day: 'numeric'
    });
    if (d !== lastDate) {
      grouped.push({ date: d, type: 'date' });
      lastDate = d;
    }
    grouped.push(m);
  });

  return (
    <div className="chat-window">
      <div className="messages">
        {grouped.map((item, i) => {
          if (item.type === 'date') {
            return (
              <div key={`date-${i}`} className="date-separator">
                {item.date}
              </div>
            );
          }
          if (item.type === 'system') {
            return (
              <div key={item.id} className="system-msg">
                {item.content}
              </div>
            );
          }
          const mine = item.sender_id === userId;
          return (
            <div
              key={item.id}
              className={`message ${mine ? 'mine' : 'other'}`}
            >
              {item.content}
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <div className="input-area">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="輸入訊息..."
        />
        <button onClick={sendMessage}>送出</button>
      </div>
    </div>
  );
}
