import React, { useEffect, useState, useMemo, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import './ChatRoomPage.css';

function ChatRoomPage() {
  const { user, isAuthLoaded } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [otherUserId, setOtherUserId] = useState('');
  const [roomJoined, setRoomJoined] = useState(false);

  const token = user?.accessToken;
  const myId = user?.userID;

  // ref to the scrolling container
  const chatHistoryRef = useRef(null);
  // ref to the bottom sentinel
  const bottomRef = useRef(null);

  // are we currently scrolled to (or very near) the bottom?
  const [isAtBottom, setIsAtBottom] = useState(true);

  // update isAtBottom on any manual scroll
  const handleScroll = () => {
    const el = chatHistoryRef.current;
    if (!el) return;
    // threshold in px
    const threshold = 50;
    const distanceFromBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight;
    setIsAtBottom(distanceFromBottom < threshold);
  };

  const socket = useMemo(() => {
    if (!token) return null;
    return io('http://localhost:3000', { auth: { token } });
  }, [token]);

  // join room, fetch history, subscribe to new messages
  useEffect(() => {
    if (!isAuthLoaded || !socket || !roomJoined) return;

    socket.emit('joinRoom', { otherUserId });
    fetch(`http://localhost:3000/chat/history/${otherUserId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(hist => setMessages(hist))
      .catch(err => console.error('❌ History fetch error:', err));

    socket.on('privateMessage', msg => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off('privateMessage');
    };
  }, [isAuthLoaded, socket, roomJoined, otherUserId, token]);

  // whenever messages change, scroll to bottom *if* user was already at bottom
  useEffect(() => {
    if (isAtBottom && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isAtBottom]);

  const send = () => {
    if (!input || !socket) return;
    socket.emit('privateMessage', { to: otherUserId, content: input });
    setInput('');
  };

  const handleJoinRoom = () => {
    if (otherUserId.trim()) setRoomJoined(true);
  };

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
        {/* sentinel element to scroll into view */}
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

