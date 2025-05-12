import React, { useState } from 'react';
import './userDashboard.css';

function UserDashboard() {
  const now = new Date();

  // add ISO date strings to your test data
  const [publicReservations] = useState([
    { id: 1, court: 'NTU Gym 1', date: '2025-05-10T10:00:00', host: 'Alice' },
    { id: 2, court: 'Daan Park', date: '2025-04-20T14:00:00', host: 'Bob' },
  ]);

  const [friendReservations] = useState([
    { id: 3, court: 'Shida Court', date: '2025-06-01T18:00:00', host: 'Charlie' },
  ]);

  const [mySchedule] = useState([
    { id: 5, court: 'Daan Park', date: '2025-05-05T08:00:00', role: 'Player' },
    { id: 6, court: 'Shida Court', date: '2025-04-01T18:00:00', role: 'Host' },
  ]);

  // merge and normalize
  const allEvents = [
    ...publicReservations.map(r => ({ ...r, type: 'Public' })),
    ...friendReservations.map(r => ({ ...r, type: 'Friend' })),
    ...mySchedule.map(r => ({ ...r, type: 'Mine', host: r.role })),
  ];

  // filter future, sort by date
  const futureEvents = allEvents
    .filter(evt => new Date(evt.date) > now)
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="dashboard">
      <h2>Upcoming Reservations</h2>
      {futureEvents.length === 0 ? (
        <p>No upcoming events.</p>
      ) : (
        <ul className="dashboard-list">
          {futureEvents.map(evt => {
            const dt = new Date(evt.date);
            const dateStr = dt.toLocaleDateString();
            const timeStr = dt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(evt.court)}`;

            return (
              <li key={evt.id} className="dashboard-item">
                <div>
                  <strong>{evt.court}</strong> <em>({evt.type})</em><br/>
                  {dateStr} @ {timeStr} — Host: {evt.host}
                </div>
                <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                  View on map
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default UserDashboard;