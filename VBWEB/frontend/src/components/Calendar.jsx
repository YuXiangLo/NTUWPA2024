import React, { useEffect, useState } from 'react';
import { DayPilot, DayPilotCalendar, DayPilotNavigator } from "@daypilot/daypilot-lite-react";
import "./Calendar.css";

const Calendar = () => {
  const [calendar, setCalendar] = useState(null);
  const [events, setEvents] = useState([]);
  const [startDate, setStartDate] = useState("2025-10-05"); // yyyy-MM-dd
  const [showNav, setShowNav] = useState(false);
  const [selectedTag, setSelectedTag] = useState('Host');

  // Define tag colors
  const tagColors = {
    Host: '#1e90ff',    // DodgerBlue
    Guest: '#6aa84f'    // Green
  };

  // Navigate back one week
  const prevWeek = () => {
    const currentDate = new DayPilot.Date(startDate);
    const newDate = currentDate.addDays(-7);
    setStartDate(newDate.toString("yyyy-MM-dd"));
  };

  // Navigate forward one week
  const nextWeek = () => {
    const currentDate = new DayPilot.Date(startDate);
    const newDate = currentDate.addDays(7);
    setStartDate(newDate.toString("yyyy-MM-dd"));
  };

  // Toggle the navigator display
  const toggleNavigator = () => {
    setShowNav(!showNav);
  };

  // Handle selection in the navigator
  const onNavigatorSelect = args => {
    setStartDate(args.day.toString("yyyy-MM-dd"));
    setShowNav(false);
  };

  // Edit existing event text
  const editEvent = async (e) => {
    const modal = await DayPilot.Modal.prompt("Update event text:", e.text());
    if (!modal.result) {
      return;
    }
    e.data.text = modal.result;
    calendar && calendar.events.update(e);
  };

  // Calendar configuration
  const config = {
    viewType: "Week",
    durationBarVisible: false,
    timeRangeSelectedHandling: "Enabled",
    onTimeRangeSelected: async args => {
      if (!calendar) return;
      const modal = await DayPilot.Modal.prompt("Create a new event:", "Event");
      calendar.clearSelection();
      if (!modal.result) {
        return;
      }
      calendar.events.add({
        start: args.start,
        end: args.end,
        id: DayPilot.guid(),
        text: `${modal.result} (${selectedTag})`,
        backColor: tagColors[selectedTag],
        tag: selectedTag
      });
    },
    onEventClick: async args => {
      await editEvent(args.e);
    },
    contextMenu: new DayPilot.Menu({
      items: [
        { text: "Delete", onClick: async args => calendar && calendar.events.remove(args.source) },
        { text: "-" },
        { text: "Edit...", onClick: async args => await editEvent(args.source) }
      ]
    }),
    onBeforeEventRender: args => {
      args.data.areas = [
        {
          top: 3,
          right: 3,
          width: 20,
          height: 20,
          symbol: "icons/daypilot.svg#minichevron-down-2",
          fontColor: "#fff",
          toolTip: "Show context menu",
          action: "ContextMenu",
        },
        {
          top: 3,
          right: 25,
          width: 20,
          height: 20,
          symbol: "icons/daypilot.svg#x-circle",
          fontColor: "#fff",
          toolTip: "Delete event",
          action: "None",
          onClick: async args => calendar && calendar.events.remove(args.source)
        }
      ];
      const participants = args.data.participants;
      if (participants > 0) {
        for (let i = 0; i < participants; i++) {
          args.data.areas.push({
            bottom: 5,
            right: 5 + i * 30,
            width: 24,
            height: 24,
            action: "None",
            image: `https://picsum.photos/24/24?random=${i}`,
            style: "border-radius: 50%; border: 2px solid #fff; overflow: hidden;",
          });
        }
      }
    }
  };

  // Initialize some sample events with tags
  useEffect(() => {
    setEvents([
      { id: 1, text: "Event 1 (Host)", start: "2025-10-06T10:30:00", end: "2025-10-06T13:00:00", participants: 2, tag: "Host", backColor: tagColors.Host },
      { id: 2, text: "Event 2 (Guest)", start: "2025-10-07T09:30:00", end: "2025-10-07T11:30:00", participants: 1, tag: "Guest", backColor: tagColors.Guest },
      { id: 3, text: "Event 3 (Host)", start: "2025-10-07T12:00:00", end: "2025-10-07T15:00:00", participants: 3, tag: "Host", backColor: tagColors.Host },
      { id: 4, text: "Event 4 (Guest)", start: "2025-10-05T11:30:00", end: "2025-10-05T14:30:00", participants: 4, tag: "Guest", backColor: tagColors.Guest }
    ]);
  }, []);

  // Get calendar instance reference
  const getCalendarRef = control => setCalendar(control);

  return (
    <div style={{ padding: 10, position: 'relative' }}>
      {/* Controls row */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 8 }}>
        <button onClick={prevWeek} style={{ marginRight: 4 }}>←</button>
        <button onClick={nextWeek} style={{ marginRight: 12 }}>→</button>
        <button onClick={toggleNavigator} style={{ marginRight: 12 }}>Go to week…</button>
        {/* Tag selector buttons */}
        <button
          onClick={() => setSelectedTag('Host')}
          style={{
            marginRight: 4,
            background: selectedTag === 'Host' ? tagColors.Host : undefined,
            color: selectedTag === 'Host' ? '#fff' : undefined
          }}
        >
          Host
        </button>
        <button
          onClick={() => setSelectedTag('Guest')}
          style={{
            background: selectedTag === 'Guest' ? tagColors.Guest : undefined,
            color: selectedTag === 'Guest' ? '#fff' : undefined
          }}
        >
          Guest
        </button>
      </div>

      {/* Conditional Navigator overlay */}
      {showNav && (
        <div style={{ position: 'absolute', top: 40, right: 10, zIndex: 10, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
          <DayPilotNavigator
            selectMode="Week"
            showMonths={1}
            skipMonths={1}
            selectionDay={startDate}
            onTimeRangeSelected={onNavigatorSelect}
          />
        </div>
      )}

      <DayPilotCalendar
        {...config}
        events={events}
        startDate={startDate}
        controlRef={getCalendarRef}
      />
    </div>
  );
};

export default Calendar;