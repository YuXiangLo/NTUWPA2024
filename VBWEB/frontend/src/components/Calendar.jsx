import React, { useEffect, useState } from 'react';
import { DayPilot, DayPilotCalendar, DayPilotNavigator } from "@daypilot/daypilot-lite-react";
import "./Calendar.css";

/**
 * Calendar component with colored tags and a modal dialog that now also lets
 * users edit the event Start/End using a single **datetime** field for each.
 *
 * The dialog values are pre‑filled using the second parameter of
 * DayPilot.Modal.form() so the default values work for every field (text, radio
 * and the two new datetime pickers).
 */
const Calendar = () => {
  const [calendar, setCalendar] = useState(null);
  const [events, setEvents] = useState([]);
  const [startDate, setStartDate] = useState("2025-10-05");
  const [showNav, setShowNav] = useState(false);

  // Tag palette
  const tagColors = {
    Host: '#1e90ff',
    Guest: '#6aa84f',
    Another: '#ab12ef'
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // Navigation helpers
  // ──────────────────────────────────────────────────────────────────────────────
  const prevWeek = () => setStartDate(new DayPilot.Date(startDate).addDays(-7).toString("yyyy-MM-dd"));
  const nextWeek = () => setStartDate(new DayPilot.Date(startDate).addDays(7).toString("yyyy-MM-dd"));
  const toggleNavigator = () => setShowNav(!showNav);
  const onNavigatorSelect = args => { setStartDate(args.day.toString("yyyy-MM-dd")); setShowNav(false); };

  // ----------------------------------------------------------------------------
  // Edit an existing event – the dialog is pre‑filled with current values
  // ----------------------------------------------------------------------------
  const editEvent = async (e) => {
    if (!calendar) return;
    const data = e.data;

    const tagOptions = Object.keys(tagColors).map(tag => ({ name: tag, id: tag }));
    const defaultName = data.text.replace(new RegExp(` \\(${data.tag}\\)$`), "");

    const form = [
      { name: "Event Name:", id: "text", type: "text", placeholder: "Event Name" },
      { name: "Tag:",        id: "tag",  type: "radio", options: tagOptions },
      { name: "Start:",      id: "start", type: "datetime" },
      { name: "End:",        id: "end",   type: "datetime" }
    ];

    const modal = await DayPilot.Modal.form(form, {
      text: defaultName,
      tag: data.tag,
      start: data.start,
      end: data.end
    });

    if (modal.canceled) return;

    const { text, tag, start, end } = modal.result;

    data.text      = `${text} (${tag})`;
    data.tag       = tag;
    data.start     = start;
    data.end       = end;
    data.backColor = tagColors[tag];

    calendar.events.update(e);
  };

  // ----------------------------------------------------------------------------
  // Calendar configuration (create + clicks + context menu + rendering)
  // ----------------------------------------------------------------------------
  const config = {
    viewType: "Week",
    durationBarVisible: false,
    timeRangeSelectedHandling: "Enabled",

    // Create a new event – defaults are supplied using the second argument
    onTimeRangeSelected: async args => {
      if (!calendar) return;
      const tagOptions = Object.keys(tagColors).map(tag => ({ name: tag, id: tag }));

      const form = [
        { name: "Event Name:", id: "text", type: "text", placeholder: "Event Name" },
        { name: "Tag:",        id: "tag",  type: "radio", options: tagOptions },
        { name: "Start:",      id: "start", type: "datetime" },
        { name: "End:",        id: "end",   type: "datetime" }
      ];

      const modal = await DayPilot.Modal.form(form, {
        tag: tagOptions[0].id,
        start: args.start,
        end: args.end
      });

      calendar.clearSelection();
      if (modal.canceled) return;

      const { text, tag, start, end } = modal.result;

      calendar.events.add({
        start,
        end,
        id: DayPilot.guid(),
        text: `${(text || "Event")} (${tag})`,
        backColor: tagColors[tag],
        tag
      });
    },

    onEventClick: async args => editEvent(args.e),

    contextMenu: new DayPilot.Menu({
      items: [
        { text: "Delete", onClick: args => calendar && calendar.events.remove(args.source) },
        { text: "-" },
        { text: "Edit…",  onClick: async args => editEvent(args.source) }
      ]
    }),

    onBeforeEventRender: args => {
      args.data.areas = [
        { top: 3, right: 3,  width: 20, height: 20, symbol: "icons/daypilot.svg#minichevron-down-2", fontColor: "#fff", toolTip: "Show context menu", action: "ContextMenu" },
        { top: 3, right: 25, width: 20, height: 20, symbol: "icons/daypilot.svg#x-circle",         fontColor: "#fff", toolTip: "Delete event",       action: "None", onClick: args => calendar && calendar.events.remove(args.source) }
      ];
      const p = args.data.participants || 0;
      for (let i = 0; i < p; i++) {
        args.data.areas.push({ bottom: 5, right: 5 + i * 30, width: 24, height: 24, action: "None", image: `https://picsum.photos/24/24?random=${i}`, style: "border-radius: 50%; border: 2px solid #fff; overflow: hidden;" });
      }
      if (args.data.tag && tagColors[args.data.tag]) {
        args.data.backColor = tagColors[args.data.tag];
      }
    }
  };

  // ---------------------------------------------------------------------------
  // Initial sample events
  // ---------------------------------------------------------------------------
  useEffect(() => {
    setEvents([
      { id: 1, text: "Event 1 (Host)",    start: "2025-10-06T10:30:00", end: "2025-10-06T13:00:00", participants: 2, tag: "Host" },
      { id: 2, text: "Event 2 (Guest)",   start: "2025-10-07T09:30:00", end: "2025-10-07T11:30:00", participants: 1, tag: "Guest" },
      { id: 3, text: "Event 3 (Host)",    start: "2025-10-07T12:00:00", end: "2025-10-07T15:00:00", participants: 3, tag: "Host" },
      { id: 4, text: "Event 4 (Another)", start: "2025-10-05T11:30:00", end: "2025-10-05T14:30:00", participants: 4, tag: "Another" }
    ]);
  }, []);

  return (
    <div style={{ padding: 10, position: 'relative' }}>
      {/* Controls */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <span style={{ marginRight: 10, fontSize: '0.9em', fontWeight: 'bold' }}>Legend:</span>
          {Object.entries(tagColors).map(([tagName, color]) => (
            <div key={tagName} style={{ display: 'flex', alignItems: 'center', marginRight: 15 }}>
              <span style={{ backgroundColor: color, width: 14, height: 14, borderRadius: 3, marginRight: 5, display: 'inline-block', border: '1px solid #ccc' }} />
              <span style={{ fontSize: '0.9em' }}>{tagName}</span>
            </div>
          ))}
        </div>
        {/* Navigation */}
        <div>
          <button onClick={prevWeek} style={{ marginRight: 4 }}>←</button>
          <button onClick={nextWeek} style={{ marginRight: 12 }}>→</button>
          <button onClick={toggleNavigator}>Go to week…</button>
        </div>
      </div>

      {/* Navigator overlay */}
      {showNav && (
        <div style={{ position: 'absolute', top: 45, right: 10, zIndex: 10, background: '#fff', boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
          <DayPilotNavigator selectMode="Week" showMonths={1} skipMonths={1} selectionDay={startDate} onTimeRangeSelected={onNavigatorSelect} />
        </div>
      )}

      <DayPilotCalendar {...config} events={events} startDate={startDate} controlRef={c => setCalendar(c)} />
    </div>
  );
};

export default Calendar;
