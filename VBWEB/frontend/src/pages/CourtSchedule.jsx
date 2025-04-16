import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_DOMAIN } from '../config.js';
import './CourtSchedule.css'; // (optional) for styling

// Helper function to generate time slots from 9:00 AM to 10:00 PM.
function generateTimeSlots(startHour = 9, endHour = 22) {
  const slots = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    const formattedHour = hour > 12 ? hour - 12 : hour;
    const amPm = hour >= 12 ? 'PM' : 'AM';
    slots.push(`${formattedHour}:00 ${amPm}`);
  }
  return slots;
}

// Sample day headers for the chosen week (you can customize the dates)
const daysOfWeek = [
  { dayName: 'Sun', date: 'Apr 13' },
  { dayName: 'Mon', date: 'Apr 14' },
  { dayName: 'Tue', date: 'Apr 15' },
  { dayName: 'Wed', date: 'Apr 16' },
  { dayName: 'Thu', date: 'Apr 17' },
  { dayName: 'Fri', date: 'Apr 18' },
  { dayName: 'Sat', date: 'Apr 19' },
];

const SchedulePage = () => {
  const { court_id } = useParams(); // Extract court_id from URL
  const navigate = useNavigate();    // For navigation (login and redirect back)

  // Function to get current URL for redirect after login
  const getCurrentURL = () => {
    return window.location.pathname + window.location.search;
  };

  // State to hold court details (which includes venue info) from API.
  const [courtDetail, setCourtDetail] = useState(null);
  const [loadingCourt, setLoadingCourt] = useState(true);
  const [courtError, setCourtError] = useState(null);

  // State to hold time slots and booking status
  const [timeSlots, setTimeSlots] = useState([]);
  // Format: { [dayIndex_timeIndex]: 'booked' | 'available' | 'selected' }
  const [slotStatus, setSlotStatus] = useState({});

  // Fetch court details on mount.
  useEffect(() => {
    const fetchCourtDetail = async () => {
      try {
        const res = await fetch(`${API_DOMAIN}courts/court-venue-name/${court_id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch court detail');
        }
        const data = await res.json();
        console.log(data);
        setCourtDetail(data);
        setLoadingCourt(false);
      } catch (error) {
        setCourtError(error.message);
        setLoadingCourt(false);
      }
    };

    fetchCourtDetail();
  }, [court_id]);

  // Initialize calendar slots once on mount (or when court_id changes)
  useEffect(() => {
    const slots = generateTimeSlots(9, 22);
    setTimeSlots(slots);

    // In a real scenario, fetch schedule data from backend for the given court.
    // For demonstration, all slots are initialized as available.
    const initialStatus = {};
    daysOfWeek.forEach((_, dayIndex) => {
      slots.forEach((_, timeIndex) => {
        initialStatus[`${dayIndex}_${timeIndex}`] = 'available';
      });
    });
    setSlotStatus(initialStatus);
  }, [court_id]);

  // Check if the user is logged in by confirming the presence of a token
  const isUserLoggedIn = () => {
    const user = localStorage.getItem('user');
    console.log(user);
    return Boolean(user);
  };

  // Handler for clicking on a time slot cell
  const handleSlotClick = (dayIndex, timeIndex) => {
    if (!isUserLoggedIn()) {
      console.log(encodeURIComponent(getCurrentURL()));
      alert('請先登錄會員');
      // Redirect to login page with redirect URL
      navigate(`/login?redirect=${encodeURIComponent(getCurrentURL())}`);
      return;
    }
    const slotKey = `${dayIndex}_${timeIndex}`;
    setSlotStatus((prevStatus) => {
      const current = prevStatus[slotKey];
      if (current === 'booked') {
        alert('此時間段已預約！');
        return prevStatus;
      }
      return {
        ...prevStatus,
        [slotKey]: current === 'selected' ? 'available' : 'selected',
      };
    });
  };

  // Handler for confirming a booking
  const handleConfirmBooking = () => {
    if (!isUserLoggedIn()) {
      alert('You must be logged in to book a schedule.');
      navigate(`/login?redirect=${encodeURIComponent(getCurrentURL())}`);
      return;
    }

    const selectedSlots = [];
    Object.keys(slotStatus).forEach((key) => {
      if (slotStatus[key] === 'selected') {
        const [dayIndex, timeIndex] = key.split('_');
        selectedSlots.push({
          dayIndex: parseInt(dayIndex, 10),
          timeIndex: parseInt(timeIndex, 10),
        });
      }
    });

    if (selectedSlots.length === 0) {
      alert('No time slots selected!');
      return;
    }

    console.log('Selected Slots for court ', court_id, ':', selectedSlots);
    
    // For demonstration, update the status as booked.
    const updatedStatus = { ...slotStatus };
    selectedSlots.forEach(({ dayIndex, timeIndex }) => {
      const slotKey = `${dayIndex}_${timeIndex}`;
      updatedStatus[slotKey] = 'booked';
    });
    setSlotStatus(updatedStatus);
    
    alert('Your booking has been confirmed!');
  };

  // Display loading/error state while fetching court details
  if (loadingCourt)
    return <div className="booking-calendar-container">Loading court details...</div>;
  if (courtError)
    return <div className="booking-calendar-container">Error: {courtError}</div>;

  return (
    <div className="booking-calendar-container">
      {/* Title shows Venue Name and Court Name */}
      <h2>
        {courtDetail && courtDetail.venue && courtDetail.venue.name} - {courtDetail && courtDetail.name}
      </h2>
      <table className="booking-calendar-table">
        <thead>
          <tr>
            <th>Time</th>
            {daysOfWeek.map((day, index) => (
              <th key={index}>
                {day.dayName}
                <br />
                {day.date}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((time, timeIndex) => (
            <tr key={timeIndex}>
              <td className="time-label">{time}</td>
              {daysOfWeek.map((_, dayIndex) => {
                const slotKey = `${dayIndex}_${timeIndex}`;
                const status = slotStatus[slotKey] || 'available';
                const cellClass = `slot-cell ${status}`;
                return (
                  <td
                    key={slotKey}
                    className={cellClass}
                    onClick={() => handleSlotClick(dayIndex, timeIndex)}
                  >
                    {status === 'booked'
                      ? '已預約'
                      : status === 'selected'
                      ? '已選擇'
                      : ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handleConfirmBooking} className="confirm-button">
        確定預約
      </button>
    </div>
  );
};

export default SchedulePage;
