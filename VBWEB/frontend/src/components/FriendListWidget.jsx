import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  getFriends,
  sendFriendRequest
} from '../api/friends';
import './FriendListWidget.css';
import { getPendingRequests, respondFriendRequest } from '../api/friends';



const FriendListWidget = () => {
  const { user, isAuthLoaded } = useAuth();  
  const userId = user?.userID;

  const [pendingRequests, setPendingRequests] = useState([]);
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
  const loadPendingRequests = async () => {
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
      loadPendingRequests();
    }
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
      {/* Send friend request */}
      <div style={{ marginBottom: '10px' }}>
        <input
          type="email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          placeholder="Send friend request by email"
        />
        <button onClick={handleSendRequest}>Send</button>
      </div>

      {/* Friends list */}
      <ul className="friend-list-ul">
        {friends.map(friend => (
          <li key={friend.userid} className="friend-list-item">
            {friend.firstname} {friend.lastname} ({friend.gmail})
          </li>
        ))}
      </ul>

      {/* Pending requests section */}
      {pendingRequests.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4>Pending Requests</h4>
          <ul className="friend-list-ul">
            {pendingRequests.map(req => (
              <li key={req.userid} className="friend-list-item">
                {req.firstname} {req.lastname} ({req.gmail})
                <button
                  style={{ marginLeft: '10px' }}
                  onClick={async () => {
                    await respondFriendRequest(userId, req.userid, true);
                    await loadFriends();
                    await loadPendingRequests();
                  }}
                >
                  Accept
                </button>
                <button
                  style={{ marginLeft: '5px' }}
                  onClick={async () => {
                    await respondFriendRequest(userId, req.userid, false);
                    await loadPendingRequests();
                  }}
                >
                  Reject
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Status messages */}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {message && <div style={{ color: 'green' }}>{message}</div>}
    </div>
  )}
</div>
  );
};

export default FriendListWidget;
