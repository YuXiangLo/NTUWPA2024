import React, { useState, useEffect } from 'react';
import './BookingCalendar.css'; // (optional) for styling

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

// Sample day headers for the chosen week
// In a real application, you might generate these based on the current date.
const daysOfWeek = [
  { dayName: 'Sun', date: 'Apr 13' },
  { dayName: 'Mon', date: 'Apr 14' },
  { dayName: 'Tue', date: 'Apr 15' },
  { dayName: 'Wed', date: 'Apr 16' },
  { dayName: 'Thu', date: 'Apr 17' },
  { dayName: 'Fri', date: 'Apr 18' },
  { dayName: 'Sat', date: 'Apr 19' },
];

const BookingCalendar = () => {
  // State to hold all time slots in a day
  const [timeSlots, setTimeSlots] = useState([]);
  // State to track which slots are booked vs. available
  // Format: { [dayIndex_timeIndex]: 'booked' | 'available' | 'selected' }
  const [slotStatus, setSlotStatus] = useState({});

  useEffect(() => {
    // Generate times from 9:00 AM to 10:00 PM
    const slots = generateTimeSlots(9, 22);
    setTimeSlots(slots);

    // In a real scenario, call your backend (NestJS + Supabase) to fetch existing bookings.
    // Then update `slotStatus` accordingly for each day/time combination.
    // For now, everything is 'available' by default.
    const initialStatus = {};
    daysOfWeek.forEach((_, dayIndex) => {
      slots.forEach((_, timeIndex) => {
        initialStatus[`${dayIndex}_${timeIndex}`] = 'available';
      });
    });
    setSlotStatus(initialStatus);
  }, []);

  // Handler for clicking on a cell
  const handleSlotClick = (dayIndex, timeIndex) => {
    const slotKey = `${dayIndex}_${timeIndex}`;
    // If the slot is booked, do nothing. If available, toggle 'selected'.
    setSlotStatus((prevStatus) => {
      const current = prevStatus[slotKey];
      if (current === 'booked') {
        alert('This time slot is already booked!');
        return prevStatus;
      }
      // Toggle between 'available' and 'selected'
      return {
        ...prevStatus,
        [slotKey]: current === 'selected' ? 'available' : 'selected',
      };
    });
  };

  // Handler for confirming bookings
  const handleConfirmBooking = () => {
    // Gather all selected slots
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

    console.log('Selected Slots:', selectedSlots);

    // In a real scenario, you’d send a request to your backend to book these time slots.
    // On success, update the slotStatus to 'booked' for each selected slot.
    const updatedStatus = { ...slotStatus };
    selectedSlots.forEach(({ dayIndex, timeIndex }) => {
      const slotKey = `${dayIndex}_${timeIndex}`;
      updatedStatus[slotKey] = 'booked';
    });
    setSlotStatus(updatedStatus);

    alert('Your booking has been confirmed!');
  };

  return (
    <div className="booking-calendar-container">
      <h2>Booking Calendar</h2>
      <table className="booking-calendar-table">
        <thead>
          <tr>
            <th>Time</th>
            {daysOfWeek.map((day, index) => (
              <th key={index}>{day.dayName}<br/>{day.date}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((time, timeIndex) => (
            <tr key={timeIndex}>
              {/* First column: time label */}
              <td className="time-label">{time}</td>
              {/* Next columns: days */}
              {daysOfWeek.map((_, dayIndex) => {
                const slotKey = `${dayIndex}_${timeIndex}`;
                const status = slotStatus[slotKey] || 'available';

                // You can adjust the styling based on status
                const cellClass = `slot-cell ${status}`;

                return (
                  <td
                    key={slotKey}
                    className={cellClass}
                    onClick={() => handleSlotClick(dayIndex, timeIndex)}
                  >
                    {status === 'booked' ? 'Booked' : ''}
                    {status === 'selected' ? 'Selected' : ''}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={handleConfirmBooking} className="confirm-button">
        Book Now
      </button>
    </div>
  );
};

export default BookingCalendar;
