import React, { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { API_DOMAIN, WS_DOMAIN } from '../config.js';
import { useAuth } from '../context/AuthContext.jsx';
import './ChatWindow.css';

export default function ChatWindow({ chatId, partnerName, onClose }) {
  const { user } = useAuth();
  const token = user?.accessToken;
  const userId = user?.userID;

  const [isComposing, setIsComposing] = useState(false);
  const [socket, setSocket] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const didInit = useRef(false);
  const [input, setInput] = useState('');
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const containerRef = useRef();
  const endRef = useRef();

  const PAGE_SIZE = 50;

  const dedupe = arr => {
    const seen = new Set();
    return arr.filter(m => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  };

  // load a page of messages (newest first, then reverse)
  const loadPage = useCallback(
    async before => {
      if (!chatId || !token || didInit.current) return;
      didInit.current = true;

      setLoadingMore(true);
      try {
        const base = `${API_DOMAIN}/chats/${chatId}/messages`;
        const url =
          base +
          `?limit=${PAGE_SIZE}` +
          (before ? `&before=${encodeURIComponent(before)}` : '');

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
          method: 'GET'
        });
        const data = await res.json();
        const page = dedupe(data);

        // check if we got less than a full page
        if (page.length < PAGE_SIZE) setHasMore(false);

        if (before) {
          // prepend older messages
          setMsgs(prev => dedupe([...page, ...prev]));
        } else {
          // initial load
          setMsgs(dedupe(page));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingMore(false);
      }
    },
    [chatId, token]
  );

  // join & load initial history & listen
  useEffect(() => {
    if (!chatId || !token) return;

    const sock = io(WS_DOMAIN, { auth: { token } });
    setSocket(sock);
    sock.emit('joinChat', { chatId });

    // initial fetch
    loadPage();

    sock.on('newMessage', m => {
      setMsgs(prev => dedupe([...prev, m]));
    });

    // mark read when opening
    fetch(`${API_DOMAIN}/chats/${chatId}/read`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }).catch(console.error);

    return () => {
      sock.disconnect();
      setSocket(null);
    };
  }, [chatId, token, loadPage]);

  // infinite-scroll: load older when scrolling to top
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !hasMore) return;

    const onScroll = () => {
      if (container.scrollTop < 100 && !loadingMore && msgs.length) {
        const earliest = msgs[0].created_at;
        loadPage(earliest);
      }
    };

    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, [msgs, hasMore, loadingMore, loadPage]);

  // scroll on new messages (bottom)
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
      created_at: new Date().toISOString()
    };
    setMsgs(prev => [...prev, local]);

    socket.emit('sendMessage', { chatId, content: input }, saved => {
      setMsgs(prev => dedupe(prev.map(m => (m.id === tmpId ? saved : m))));
    });

    setInput('');
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
      <div className="messages" ref={containerRef}>
        {loadingMore && <div className="loading-old">載入中…</div>}

        {grouped.map((item, i) => {
          // console.log(item);
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
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={() => setIsComposing(false)}
        onKeyDown={e => {
          if (e.key === 'Enter' && !isComposing) {
            sendMessage(input);
            setInput('');
          }
        }}
        placeholder="輸入訊息..."
      />
        <button onClick={sendMessage}>送出</button>
      </div>
    </div>
  );
}
