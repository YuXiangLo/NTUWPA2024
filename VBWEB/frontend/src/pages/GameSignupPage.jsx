import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { API_DOMAIN } from '../config.js';
import './GameSignupPage.css';

function GameSignupPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [games, setGames] = useState([]);
  const [selectedGame, setSelectedGame] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch list of upcoming games
  useEffect(() => {
    setLoading(true);
    fetch(`${API_DOMAIN}games`)
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json() })
      .then(data => setGames(data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSignup = async () => {
    if (!selectedGame) return;
    setError(null);
    try {
      const res = await fetch(
        `${API_DOMAIN}games/${selectedGame}/signup`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user.id })
        }
      );
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || res.statusText);
      }
      navigate('/'); // Redirect after successful signup
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="game-signup-page">
      <h2>Sign Up for a Game</h2>

      {loading && <p>Loading games…</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <div className="signup-form">
          <label htmlFor="game-select">Choose a game:</label>
          <select
            id="game-select"
            value={selectedGame}
            onChange={e => setSelectedGame(e.target.value)}
          >
            <option value="">-- Select Game --</option>
            {games.map(game => (
              <option key={game.game_id} value={game.game_id}>
                {game.title} ({new Date(game.start_time).toLocaleString()})
              </option>
            ))}
          </select>

          <button
            onClick={handleSignup}
            disabled={!selectedGame}
          >
            Sign Up
          </button>
        </div>
      )}
    </div>
  );
}

export default GameSignupPage;