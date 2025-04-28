import React, { useEffect, useState, useMemo } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

function ChatRoomPage() {
  const { user, isAuthLoaded } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [otherUserId, setOtherUserId] = useState('');
  const [roomJoined, setRoomJoined] = useState(false);

  // **Use your stored accessToken, not `user.token`**
  const token = user?.accessToken;
  const myId = user?.userID;
  console.log('👤 AuthContext user:', user);

  const socket = useMemo(() => {
    if (!token) {
      console.warn('⚠️  No token yet, socket will not initialize');
      return null;
    }
    console.log('🔗 Initializing socket with token:', token);
    const s = io('http://localhost:3000', { auth: { token } });
    console.log('🔌 Socket created, id=', s.id);
    return s;
  }, [token]);

  useEffect(() => {
    if (!isAuthLoaded || !socket) return;
    console.log(`⚙️  Ready: socket.id=${socket.id}, myId=${myId}, roomJoined=${roomJoined}`);

    if (roomJoined) {
      console.log(`➡️  Emitting joinRoom with otherUserId=${otherUserId}`);
      socket.emit('joinRoom', { otherUserId });

      fetch(`http://localhost:3000/chat/history/${otherUserId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(hist => {
          console.log('📜 Chat history fetched:', hist);
          setMessages(hist);
        })
        .catch(err => console.error('❌ History fetch error:', err));

      socket.on('privateMessage', msg => {
        console.log('📨 Received privateMessage:', msg);
        setMessages(prev => [...prev, msg]);
      });
    }

    return () => {
      console.log('🧹 Cleaning up privateMessage listener');
      socket?.off('privateMessage');
    };
  }, [isAuthLoaded, socket, roomJoined, otherUserId, token, myId]);

  const send = () => {
    if (!input || !socket) return;
    console.log(`✏️  Sending message to ${otherUserId}:`, input);
    socket.emit('privateMessage', { to: otherUserId, content: input });
    setInput('');
  };

  const handleJoinRoom = () => {
    if (otherUserId.trim()) {
      console.log('🚀 Joining room with:', otherUserId);
      setRoomJoined(true);
    }
  };

  if (!isAuthLoaded) return <div>Loading...</div>;
  if (!roomJoined) {
    return (
      <div style={{ maxWidth: 400, margin: '0 auto', paddingTop: 100 }}>
        <h2>Enter User ID to Chat</h2>
        <input
          style={{ width: '100%', padding: 8, marginBottom: 8 }}
          value={otherUserId}
          onChange={e => setOtherUserId(e.target.value)}
          placeholder="Enter other user's ID"
        />
        <button onClick={handleJoinRoom} style={{ width: '100%', padding: '8px 16px' }}>
          Join Chat
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <h2>Chat with {otherUserId}</h2>
      <div style={{ height: 300, overflowY: 'scroll', border: '1px solid #ccc', padding: 10 }}>
        {messages.map((m, i) => (
          <div key={i}>
            <strong>{m.from === myId ? 'You' : m.from}</strong>: {m.content}
            <em> ({new Date(m.timestamp).toLocaleTimeString()})</em>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', marginTop: 8 }}>
        <input
          style={{ flex: 1, padding: 8 }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
          placeholder="Type a message..."
        />
        <button onClick={send} style={{ marginLeft: 8, padding: '8px 16px' }}>
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatRoomPage;
