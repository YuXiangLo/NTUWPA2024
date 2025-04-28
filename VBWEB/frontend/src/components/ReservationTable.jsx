import React, { useState, useEffect } from 'react';
import { API_DOMAIN } from '../config.js';
import './ReservationTable.css';

const ReservationTable = () => {
  // read userID directly from localStorage
  const stored = localStorage.getItem('user');
  const userID = stored ? JSON.parse(stored).userID : null;

  const [myRes, setMyRes] = useState([]);
  const [loadingRes, setLoadingRes] = useState(false);
  const [errRes, setErrRes] = useState(null);

  // maps for id → name lookup
  const [venueMap, setVenueMap] = useState({});
  const [courtMap, setCourtMap]   = useState({});

  // fetch all venues + courts once for name lookups
  useEffect(() => {
    fetch(`${API_DOMAIN}venues`)
      .then(r => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      })
      .then(venues => {
        const vMap = {};
        const cMap = {};
        venues.forEach(v => {
          vMap[v.venue_id] = v.name;
          (v.court || []).forEach(c => {
            cMap[c.court_id] = c.name;
          });
        });
        setVenueMap(vMap);
        setCourtMap(cMap);
      })
      .catch(e => console.error('Failed to load venues for names:', e));
  }, []);

  // fetch user reservations
  useEffect(() => {
    if (!userID) return;
    setLoadingRes(true);
    fetch(`${API_DOMAIN}reserve/user/${userID}`)
      .then(r => {
        if (!r.ok) throw new Error(r.statusText);
        return r.json();
      })
      .then(data => {
        data.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
        setMyRes(data);
      })
      .catch(e => setErrRes(e.message))
      .finally(() => setLoadingRes(false));
  }, [userID]);

  if (!userID) return null;

  return (
    <section className="reservation-table-container" style={{ marginTop: 20 }}>
      <h3>Your Upcoming Reservations</h3>
      {loadingRes && <p>Loading…</p>}
      {errRes && <p style={{ color: 'red' }}>{errRes}</p>}
      {!loadingRes && !errRes && myRes.length > 0 && (
        <table className="reservation-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Venue</th>
              <th>Court</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {myRes.map((r, i) => {
              const s = new Date(r.start_time);
              const e = new Date(r.end_time);
              const venueName = venueMap[r.venue_id] || r.venue_id;
              const courtName = courtMap[r.court_id] || r.court_id;
              return (
                <tr key={i}>
                  <td>{s.toLocaleDateString()}</td>
                  <td>{venueName}</td>
                  <td>{courtName}</td>
                  <td>
                    {s.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {' – '}
                    {e.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      {!loadingRes && !errRes && myRes.length === 0 && (
        <p>No upcoming reservations.</p>
      )}
    </section>
  );
};

export default ReservationTable;