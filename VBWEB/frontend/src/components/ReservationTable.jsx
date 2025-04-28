import React, { useState, useEffect } from 'react';
import { API_DOMAIN } from '../config.js';

const ReservationTable = ({ courtId, start, end }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!courtId) return;
    setLoading(true);
    fetch(`${API_DOMAIN}reserve/court/${courtId}?start=${start}&end=${end}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setReservations(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [courtId, start, end]);

  if (loading) {
    return <div>Loading reservations...</div>;
  }
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <table className="reservation-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Venue</th>
          <th>Court</th>
          <th>Time Range</th>
        </tr>
      </thead>
      <tbody>
        {reservations.map((reservation, index) => {
          // Derive the date from start_time. Adjust formatting as needed.
          const dateObj = new Date(reservation.start_time);
          const dateString = dateObj.toLocaleDateString();
          const startTimeString = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          // If your backend returns end_time, you can format it similarly
          const endTimeObj = new Date(reservation.end_time);
          const endTimeString = endTimeObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          // If your backend returns venue_id, venue_name, court_id, court_name, destructure them accordingly.
          const venueName = reservation.venue_name || reservation.venue_id || '--';
          const courtName = reservation.court_name || reservation.court_id || '--';

          return (
            <tr key={index}>
              <td>{dateString}</td>
              <td>{venueName}</td>
              <td>{courtName}</td>
              <td>{startTimeString} - {endTimeString}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default ReservationTable;