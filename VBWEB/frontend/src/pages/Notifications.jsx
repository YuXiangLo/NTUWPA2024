import React from "react";
import { FaUserFriends, FaUser } from "react-icons/fa";
import "./Notifications.css";

function Notifications() {
  const friendRequests = [
    {
      id: 1,
      friendName: "Alice",
      eventName: "Beach Volleyball Meetup",
      venueName: "Daan Beach Court",
      venueAddress: "No.123, Daan Road, Taipei",
      details: "Casual game, bring your own ball.",
    },
    {
      id: 1,
      friendName: "Alice",
      eventName: "Beach Volleyball Meetup",
      venueName: "Daan Beach Court",
      venueAddress: "No.123, Daan Road, Taipei",
      details: "Casual game, bring your own ball.",
    },
    {
      id: 2,
      friendName: "Bob",
      eventName: "Moonlight Game",
      venueName: "Shida Court",
      venueAddress: "No.45, Shida Road, Taipei",
      details: "Night play under lights, please RSVP.",
    },
  ];

  const hostRequests = [
    {
      id: 3,
      userName: "Charlie",
      eventName: "Indoor League Finals",
    },
    {
      id: 4,
      userName: "Dana",
      eventName: "Sunday Friendly",
    },
  ];

  const handleAccept = (id) => {
    console.log("Accepted request", id);
  };
  const handleReject = (id) => {
    console.log("Rejected request", id);
  };

  return (
    <div className="notifications-container">
      <h2>Friend Join Requests</h2>
      {friendRequests.map((req) => (
        <div key={req.id} className="notification-item">
          <div className="notification-header">
            <span>
              <FaUserFriends size={20} />
              &nbsp;
              <strong>{req.friendName}</strong> asks you to join{" "}
              <em>{req.eventName}</em>:
            </span>
            <div className="notification-actions">
              <button className="accept-btn">✔</button>
              <button className="reject-btn">✖</button>
            </div>
          </div>
          <table className="notification-table">
            <tbody>
              <tr>
                <td>Event:</td>
                <td>{req.eventName}</td>
              </tr>
              <tr>
                <td>Venue:</td>
                <td>{req.venueName}</td>
              </tr>
              <tr>
                <td>Address:</td>
                <td>{req.venueAddress}</td>
              </tr>
              <tr>
                <td>Details:</td>
                <td>{req.details}</td>
              </tr>
            </tbody>
          </table>
        </div>
      ))}

      <h2>Your Hosted Event Requests</h2>
      {hostRequests.map((req) => (
        <div key={req.id} className="notification-item">
          
          <div className="notification-header">
            <span>
              <FaUser size={20} />
              &nbsp;
              <strong>{req.userName}</strong> asks to join your event{" "}
              <em>{req.eventName}</em>:
            </span>
            <div className="notification-actions">
              <button className="accept-btn">✔</button>
              <button className="reject-btn">✖</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Notifications;
