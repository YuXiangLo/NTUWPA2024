import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_DOMAIN } from '../config.js';
import './GameCreationPage.css';

function GameCreationPage() {
  const navigate = useNavigate();

  // Form fields
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [venueId, setVenueId] = useState('');
  const [courtId, setCourtId] = useState('');
  const [venues, setVenues] = useState([]);
  const [courts, setCourts] = useState([]);
  const [error, setError] = useState(null);

  // Fetch all venues on mount
  useEffect(() => {
    fetch(`${API_DOMAIN}venues`)
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then(data => setVenues(data))
      .catch(err => setError(err.message));
  }, []);

  // Fetch courts whenever a venue is selected
  useEffect(() => {
    if (!venueId) return;
    fetch(`${API_DOMAIN}venues/${venueId}`)
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then(data => setCourts(data.court || []))
      .catch(err => setError(err.message));
  }, [venueId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const payload = {
      title,
      date,
      start_time: `${date}T${startTime}:00Z`,
      end_time: `${date}T${endTime}:00Z`,
      venue_id: venueId,
      court_id: courtId,
    };

    try {
      const res = await fetch(`${API_DOMAIN}games`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || res.statusText);
      }
      navigate('/'); // back to landing or games list
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="game-creation-page">
      <h2>Create New Game</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Title
          <input value={title} onChange={e => setTitle(e.target.value)} required />
        </label>
        <label>
          Date
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
        </label>
        <label>
          Start Time
          <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
        </label>
        <label>
          End Time
          <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
        </label>
        <label>
          Venue
          <select value={venueId} onChange={e => setVenueId(e.target.value)} required>
            <option value="">– Select Venue –</option>
            {venues.map(v => (
              <option key={v.venue_id} value={v.venue_id}>{v.name}</option>
            ))}
          </select>
        </label>
        <label>
          Court
          <select value={courtId} onChange={e => setCourtId(e.target.value)} required disabled={!courts.length}>
            <option value="">– Select Court –</option>
            {courts.map(c => (
              <option key={c.court_id} value={c.court_id}>{c.name}</option>
            ))}
          </select>
        </label>
        <button type="submit">Create Game</button>
      </form>
    </div>
  );
}

export default GameCreationPage;