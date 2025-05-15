// src/pages/AvailableCustomReservationsPage.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { API_DOMAIN } from '../config';

export default function AvailableCustomReservationsPage() {
  const { user } = useAuth();
  const token = user?.accessToken;

  const [resvs, setResvs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${API_DOMAIN}/custom-reservations/available`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json() })
      .then(setResvs)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [token]);

  // ...then render a table exactly like AvailableReservationsPage.jsx,
  // just using r.venue_name, r.address, r.court_name, r.currentPlayers, etc.
}
