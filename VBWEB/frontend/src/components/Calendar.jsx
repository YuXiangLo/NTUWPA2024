import React, { useEffect, useState } from 'react';
import { DayPilot, DayPilotCalendar, DayPilotNavigator } from "@daypilot/daypilot-lite-react";
import "./Calendar.css";

const Calendar = () => {
  const [calendar, setCalendar] = useState(null);
  const [events, setEvents] = useState([]);
  const [startDate, setStartDate] = useState("2025-10-05");
  const [showNav, setShowNav] = useState(false);

  // Define tag colors
  const tagColors = {
    Host: '#1e90ff',  
    Guest: '#6aa84f', 
    Another: '#ab12ef'
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

  // Edit existing event using the same form as "create"
  const editEvent = async (e) => {
    if (!calendar) return;

    const data = e.data;
    // Prepare tag options
    const tagOptions = Object.keys(tagColors).map(tag => ({ name: tag, id: tag }));

    // Strip the tag suffix from the text for the input
    const defaultName = data.text.replace(new RegExp(` \\(${data.tag}\\)$`), "");

    // Show the form modal
    const modal = await DayPilot.Modal.form([
      { name: "Event Name:", id: "text", type: "text", placeholder: "Event Name", value: defaultName },
      { name: "Tag:",        id: "tag",  type: "radio",  options: tagOptions, value: tagOptions[0].id }
    ], { theme: "modal_flat" });

    // If user cancelled
    if (modal.canceled || !modal.result) {
      return;
    }

    // Update event data
    data.text      = `${modal.result.text} (${modal.result.tag})`;
    data.tag       = modal.result.tag;
    data.backColor = tagColors[modal.result.tag];

    // Push update to the calendar
    calendar.events.update(e);
  };

  // Calendar configuration
  const config = {
    viewType: "Week",
    durationBarVisible: false,
    timeRangeSelectedHandling: "Enabled",
    onTimeRangeSelected: async args => {
      if (!calendar) return;

      const tagOptions = Object.keys(tagColors).map(tag => ({ name: tag, id: tag }));

      const modal = await DayPilot.Modal.form([
        { name: "Event Name:", id: "text", type: "text", placeholder: "Event Name" },
        { name: "Tag:",        id: "tag",  type: "radio",  options: tagOptions, value: tagOptions[0].id }
      ], { theme: "modal_flat" });
      
      calendar.clearSelection();

      if (modal.canceled || !modal.result) {
        return;
      }

      const eventName = modal.result.text || "Event";
      const selectedEventTag = modal.result.tag;

      calendar.events.add({
        start: args.start,
        end: args.end,
        id: DayPilot.guid(),
        text: `${eventName} (${selectedEventTag})`,
        backColor: tagColors[selectedEventTag],
        tag: selectedEventTag
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
      // Ensure backColor is applied based on the tag
      if (args.data.tag && tagColors[args.data.tag]) {
        args.data.backColor = tagColors[args.data.tag];
      } else {
        // Default color if tag is not recognized or not present
        // args.data.backColor = "#3c78d8"; // Example default DayPilot blue
      }
    }
  };

  // Initialize some sample events with tags
  useEffect(() => {
    setEvents([
      { id: 1, text: "Event 1 (Host)", start: "2025-10-06T10:30:00", end: "2025-10-06T13:00:00", participants: 2, tag: "Host" },
      { id: 2, text: "Event 2 (Guest)", start: "2025-10-07T09:30:00", end: "2025-10-07T11:30:00", participants: 1, tag: "Guest" },
      { id: 3, text: "Event 3 (Host)", start: "2025-10-07T12:00:00", end: "2025-10-07T15:00:00", participants: 3, tag: "Host" },
      { id: 4, text: "Event 4 (Another)", start: "2025-10-05T11:30:00", end: "2025-10-05T14:30:00", participants: 4, tag: "Another" }
    ]);
  }, []);

  // Get calendar instance reference
  const getCalendarRef = control => setCalendar(control);

  return (
    <div style={{ padding: 10, position: 'relative' }}>
      {/* Controls row with Legend and Navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: '10px', fontSize: '0.9em', fontWeight: 'bold' }}>Legend:</span>
          {Object.entries(tagColors).map(([tagName, color]) => (
            <div key={tagName} style={{ display: 'flex', alignItems: 'center', marginRight: '15px' }}>
              <span style={{
                backgroundColor: color,
                width: '14px',
                height: '14px',
                borderRadius: '3px',
                marginRight: '5px',
                display: 'inline-block',
                border: '1px solid #ccc' // Adds a light border around the color swatch
              }}></span>
              <span style={{ fontSize: '0.9em' }}>{tagName}</span>
            </div>
          ))}
        </div>

        {/* Navigation buttons */}
        <div>
          <button onClick={prevWeek} style={{ marginRight: 4 }}>←</button>
          <button onClick={nextWeek} style={{ marginRight: 12 }}>→</button>
          <button onClick={toggleNavigator}>Go to week…</button>
        </div>
      </div>

      {/* Conditional Navigator overlay */}
      {showNav && (
        <div style={{ position: 'absolute', top: 45, /* Adjusted top to prevent overlap with controls */ right: 10, zIndex: 10, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
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