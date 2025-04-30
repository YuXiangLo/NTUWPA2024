import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getFriends,
  sendFriendRequest
} from '../api/friends';
import './FriendListWidget.css';

const FriendListWidget = () => {
  const { user, isAuthLoaded } = useAuth();  
  const userId = user?.userID;

  const [isOpen, setIsOpen] = useState(false);
  const [friends, setFriends] = useState([]);
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

  useEffect(() => {
    if (isOpen && userId) loadFriends();
  }, [isOpen, userId]);

  const handleSendRequest = async () => {
    try {
      const res = await sendFriendRequest(userId, newEmail);
      setMessage(res.message);
      setNewEmail('');
    } catch (err) {
      setError(err.message);
    }
  };

  // Wait until auth is loaded, then only render if logged in
  if (!isAuthLoaded || !userId) return null;

  return (
    <div className="friend-widget-container">
      <button className="friend-toggle-button" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? 'Close Friends' : 'Open Friends'}
      </button>

      {isOpen && (
        <div className="friend-list">
          <div style={{ marginBottom: '10px' }}>
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Send friend request by email"
            />
            <button onClick={handleSendRequest}>Send</button>
          </div>

          <ul className="friend-list-ul">
            {friends.map(friend => (
              <li key={friend.userid} className="friend-list-item">
                {friend.firstname} {friend.lastname} ({friend.gmail})
              </li>
            ))}
          </ul>

          {error && <div style={{ color: 'red' }}>{error}</div>}
          {message && <div style={{ color: 'green' }}>{message}</div>}
        </div>
      )}
    </div>
  );
};

export default FriendListWidget;
