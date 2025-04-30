const API_BASE = 'http://localhost:3000/friends'; // Or your deployed NestJS endpoint

export const getFriends = async (userId) => {
  const res = await fetch(`${API_BASE}/${userId}`);
  if (!res.ok) throw new Error('Failed to fetch friends');
  return res.json();
};

export const sendFriendRequest = async (userId, email) => {
  const res = await fetch(`${API_BASE}/${userId}/request`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ receiverEmail: email }),
  });
  return res.json();
};

export const respondFriendRequest = async (receiverId, senderId, accept) => {
  const res = await fetch(`${API_BASE}/${receiverId}/respond/${senderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ accept }),
  });
  return res.json();
};

export const getPendingRequests = async (userId) => {
  const res = await fetch(`${API_BASE}/${userId}/requests`);
  if (!res.ok) throw new Error('Failed to fetch pending requests');
  return res.json();
};
