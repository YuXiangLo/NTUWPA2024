// src/components/Calendar.jsx
import React, { useEffect, useState } from 'react';
import { DayPilot, DayPilotCalendar, DayPilotNavigator } from "@daypilot/daypilot-lite-react";
import "./Calendar.css";

const Calendar = ({ eventsData }) => {
  const [calendar, setCalendar] = useState(null);
  const [events, setEvents] = useState([]);
  const [startDate, setStartDate] = useState(DayPilot.Date.today().toString("yyyy-MM-dd"));
  const [showNav, setShowNav] = useState(false);

  const statusColors = {
    pending: '#888888',
    approved: '#1e90ff'
  };

  useEffect(() => {
    if (Array.isArray(eventsData)) {
      const filtered = eventsData
        .filter(evt => evt.tag === 'pending' || evt.tag === 'approved')
        .map(evt => ({
          ...evt,
          backColor: statusColors[evt.tag]
        }));
      setEvents(filtered);
    }
  }, [eventsData]);

  const prevWeek = () => setStartDate(new DayPilot.Date(startDate).addDays(-7).toString("yyyy-MM-dd"));
  const nextWeek = () => setStartDate(new DayPilot.Date(startDate).addDays(7).toString("yyyy-MM-dd"));
  const toggleNavigator = () => setShowNav(!showNav);
  const onNavigatorSelect = args => {
    setStartDate(args.day.toString("yyyy-MM-dd"));
    setShowNav(false);
  };

  const editEvent = async e => { /* ... */ };

  const config = {
    viewType: "Week",
    durationBarVisible: false,
    timeRangeSelectedHandling: "Enabled",
    onTimeRangeSelected: async args => { /* ... */ },
    onEventClick: async args => await editEvent(args.e),
    contextMenu: new DayPilot.Menu({ items: [/* ... */] }),
    onBeforeEventRender: args => {
      args.data.backColor = statusColors[args.data.tag];
    }
  };

  const getCalendarRef = control => setCalendar(control);

  return (
    <div style={{ padding: 10, position: 'relative' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '10px', fontSize: '0.9em', fontWeight: 'bold' }}>Legend:</span>
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
              <span style={{ backgroundColor: color, width: '14px', height: '14px', borderRadius: '3px', marginRight: '5px', display: 'inline-block' }} />
              <span style={{ fontSize: '0.9em', textTransform: 'capitalize' }}>{status}</span>
            </div>
          ))}
        </div>
        <div>
          <button onClick={prevWeek} style={{ marginRight: 4 }}>←</button>
          <button onClick={nextWeek} style={{ marginRight: 12 }}>→</button>
          <button onClick={toggleNavigator}>Go to week…</button>
        </div>
      </div>

      {showNav && (
        <div style={{ position: 'absolute', top: 45, right: 10, zIndex: 10, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
          <DayPilotNavigator selectMode='Week' showMonths={1} skipMonths={1} selectionDay={startDate} onTimeRangeSelected={onNavigatorSelect} />
        </div>
      )}

      <DayPilotCalendar {...config} events={events} startDate={startDate} controlRef={getCalendarRef} />
    </div>
  );
};

export default Calendar;