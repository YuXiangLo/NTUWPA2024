import React, { useEffect, useState, useMemo, useRef } from 'react';
import io from 'socket.io-client';
import { API_DOMAIN } from '../config.js';
import { useAuth } from '../context/AuthContext';
import './ChatRoomPage.css';

function ChatRoomPage() {
  const { user, isAuthLoaded } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [otherUserId, setOtherUserId] = useState('');
  const [roomJoined, setRoomJoined] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const token = user?.accessToken;
  const myId = user?.userID;

  // refs for scrolling
  const chatHistoryRef = useRef(null);
  const bottomRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const handleScroll = () => {
    const el = chatHistoryRef.current;
    if (!el) return;
    const threshold = 50;
    const distance = el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsAtBottom(distance < threshold);
  };

  // Initialize socket
  const socket = useMemo(() => {
    if (!token) return null;
    const sock = io(API_DOMAIN, { auth: { token } });

    sock.on('connect_error', (err) => {
      console.warn('Socket connect_error:', err.message);
      if (err.message.includes('Invalid token') || err.message.includes('Unauthorized')) {
        setSessionExpired(true);
      }
    });

    return sock;
  }, [token]);

  // join room & fetch history
  useEffect(() => {
    if (!isAuthLoaded || !socket || !roomJoined) return;

    socket.emit('joinRoom', { otherUserId });

    fetch(`${API_DOMAIN}/chat/history/${otherUserId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        if (res.status === 401) {
          setSessionExpired(true);
          throw new Error('Session expired');
        }
        return res.json();
      })
      .then(hist => setMessages(hist))
      .catch(err => console.error('❌ History fetch error:', err));

    const handler = msg => setMessages(prev => [...prev, msg]);
    socket.on('privateMessage', handler);

    return () => {
      socket.off('privateMessage', handler);
    };
  }, [isAuthLoaded, socket, roomJoined, otherUserId, token]);

  // scroll to bottom
  useEffect(() => {
    if (isAtBottom && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAtBottom]);

  const send = () => {
    if (!input.trim() || !socket) return;
    socket.emit('privateMessage', { to: otherUserId, content: input.trim() });
    setInput('');
  };

  const handleJoinRoom = () => {
    if (otherUserId.trim()) setRoomJoined(true);
  };

  // If session expired, show popup
  if (sessionExpired) {
    return (
      <div className="session-expired-modal">
        <div className="modal-content">
          <h2>Session Expired</h2>
          <p>Your session has expired. Please reload to continue.</p>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      </div>
    );
  }

  if (!isAuthLoaded) return <div>Loading...</div>;

  if (!roomJoined) {
    return (
      <div className="join-room-container">
        <h2>Enter User ID to Chat</h2>
        <h6>Your ID: {user?.userID}</h6>
        <input
          value={otherUserId}
          onChange={e => setOtherUserId(e.target.value)}
          placeholder="Enter other user's ID"
        />
        <button onClick={handleJoinRoom}>Join Chat</button>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">Chat with {otherUserId}</div>
      <div
        className="chat-history"
        ref={chatHistoryRef}
        onScroll={handleScroll}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={`message ${m.from === myId ? 'you' : 'other'}`}
          >
            <strong>{m.from === myId ? 'You' : m.from}</strong>: {m.content}
            <span className="message-timestamp">
              {new Date(m.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="chat-input-container">
        <input
          className="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type a message..."
        />
        <button className="send-button" onClick={send}>
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatRoomPage;

