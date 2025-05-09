// src/pages/ManageSchedule.jsx
import React, { useEffect, useState } from 'react';
import {
  DayPilot,
  DayPilotCalendar,
  DayPilotNavigator
} from "@daypilot/daypilot-lite-react";
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_DOMAIN } from '../config';
import "./Calendar.css";

export default function ManageSchedule() {
  const { id: venueId, courtId } = useParams();
  const { user } = useAuth();
  const token = user?.accessToken;
  const navigate = useNavigate();

  const [calendar,  setCalendar]  = useState(null);
  const [events,    setEvents]    = useState([]);
  const [startDate, setStartDate] = useState(
    new DayPilot.Date().firstDayOfWeek().toString("yyyy-MM-dd")
  );
  const [showNav,   setShowNav]   = useState(false);

  // Load existing opening-hours
  useEffect(() => {
    if (!token || !calendar) return;
    fetch(
      `${API_DOMAIN}/venues/${venueId}/courts/${courtId}/opening-hours`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(r => r.json())
      .then(data => {
        const evs = data.map(rec => {
          const base    = new DayPilot.Date(startDate).addDays(rec.day_of_week);
          const isoDate = base.toString("yyyy-MM-dd");
          const start   = `${isoDate}T${rec.open_time}`;
          const end     = `${isoDate}T${rec.close_time}`;
          return {
            id:    rec.id,
            start: new DayPilot.Date(start),
            end:   new DayPilot.Date(end),
            text:  `${rec.open_time}–${rec.close_time}`
          };
        });
        setEvents(evs);
      })
      .catch(console.error);
  }, [token, calendar, startDate, venueId, courtId]);

  // Helper: check for overlap
  const hasOverlap = (newStart, newEnd, excludeId = null) => {
    return events.some(ev => {
      const evStart = new DayPilot.Date(ev.start);
      const evEnd   = new DayPilot.Date(ev.end);
      // if (excludeId && ev.data.id === excludeId) return false;
      return newStart < evEnd && evStart < newEnd;
    });
  };

  // Edit/Delete via modal with weekday dropdown + time text inputs
  const editEvent = async (e) => {
    if (!calendar) return;
    const data = e.data;
    console.log(data);

    // Weekday options
    const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const options  = weekdays.map((w,i) => ({ name: w, id: i }));

    const form = [
      { name: "Weekday:",           id: "dayOfWeek", type: "select", options },
      { name: "Open Time:",         id: "openTime",  type: "text" },
      { name: "Close Time:",        id: "closeTime", type: "text" },
      { name: "Delete this period", id: "delete",     type: "checkbox" }
    ];

    // Seed with current event values
    const currentStart = new DayPilot.Date(data.start);
    const currentEnd   = new DayPilot.Date(data.end);
    const seed = {
      dayOfWeek: currentStart.getDay() - new DayPilot.Date(startDate).getDay(),
      openTime:  currentStart.toString("HH:mm:ss"),
      closeTime: currentEnd.toString("HH:mm:ss"),
    };
    
    const modal = await DayPilot.Modal.form(form, seed);
    if (modal.canceled) return;
    const res = modal.result;

    // DELETE
    if (res.delete) {
      try {
        const del = await fetch(
          `${API_DOMAIN}/venues/${venueId}/courts/${courtId}/opening-hours/${data.id}`,
          {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (!del.ok) throw new Error(`Error ${del.status}`);
        setEvents(prev => prev.filter(ev => ev.id !== data.id));
      } catch (err) {
        alert(`刪除失敗：${err.message}`);
      }
      return;
    }

    // UPDATE: reconstruct start/end from weekday & time
    const base     = new DayPilot.Date(startDate).addDays(res.dayOfWeek);
    const newStart = new DayPilot.Date(`${base.toString("yyyy-MM-dd")}T${res.openTime}`);
    const newEnd   = new DayPilot.Date(`${base.toString("yyyy-MM-dd")}T${res.closeTime}`);

    if (hasOverlap(newStart, newEnd, data.id)) {
      alert("時間重疊，無法修改");
      return;
    }

    try {
      const upd = await fetch(
        `${API_DOMAIN}/venues/${venueId}/courts/${courtId}/opening-hours/${data.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            dayOfWeek: res.dayOfWeek,
            openTime:  res.openTime,
            closeTime: res.closeTime
          })
        }
      );
      if (!upd.ok) throw new Error(`Error ${upd.status}`);

      data.start = newStart;
      data.end   = newEnd;
      data.text  = `${res.openTime}–${res.closeTime}`;
      setEvents(prev => prev.map(ev => ev.id === data.id ? data : ev));
    } catch (err) {
      alert(`更新失敗：${err.message}`);
    }
  };

  // Calendar configuration
  const config = {
    viewType: "Week",
    weekStarts: 0,
    headerDateFormat: "dddd",
    durationBarVisible: false,
    timeRangeSelectedHandling: "Enabled",

    onTimeRangeSelected: async args => {
      calendar.clearSelection();
      const newStart = new DayPilot.Date(args.start);
      const newEnd   = new DayPilot.Date(args.end);
      if (hasOverlap(newStart, newEnd, null)) {
        alert("時間重疊，無法新增");
        return;
      }
      const dayOfWeek = newStart.getDay() - new DayPilot.Date(startDate).getDay();
      const openTime  = newStart.toString("HH:mm:ss");
      const closeTime = newEnd.toString("HH:mm:ss");

      try {
        const res = await fetch(
          `${API_DOMAIN}/venues/${venueId}/courts/${courtId}/opening-hours`,
          {
            method: 'POST',
            headers: {
              'Content-Type':'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ dayOfWeek, openTime, closeTime })
          }
        );
        if (!res.ok) throw new Error(`Error ${res.status}`);
        const created = await res.json();
        calendar.events.add({
          id:    created.id,
          start: args.start,
          end:   args.end,
          text:  `${openTime}–${closeTime}`
        });
      } catch (err) {
        alert(`新增失敗：${err.message}`);
      }
    },

    onEventClick: async args => editEvent(args.e),

    onEventMoved: async args => {
      const e = args.e;
      const newStart = new DayPilot.Date(e.data.start);
      const newEnd   = new DayPilot.Date(e.data.end);
      if (hasOverlap(newStart, newEnd, e.data.id)) {
        alert("時間重疊，無法移動");
        setEvents(prev => [...prev]);
        return;
      }
      const dayOfWeek = newStart.getDay() - new DayPilot.Date(startDate).getDay();
      const openTime  = newStart.toString("HH:mm:ss");
      const closeTime = newEnd.toString("HH:mm:ss");

      try {
        const res = await fetch(
          `${API_DOMAIN}/venues/${venueId}/courts/${courtId}/opening-hours/${e.data.id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type':'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ dayOfWeek, openTime, closeTime })
          }
        );
        if (!res.ok) throw new Error(`Error ${res.status}`);
        e.data.text = `${openTime}–${closeTime}`;
        calendar.events.update(e);
      } catch (err) {
        alert(`更新失敗：${err.message}`);
        setEvents(prev => [...prev]);
      }
    },

    events,
    startDate
  };

  // Save handler: bulk replace all periods
  const handleSave = async () => {
    const periodsDto = events.map(e => {
      const s    = new DayPilot.Date(e.start);
      const ee    = new DayPilot.Date(e.end);
      
      return {
        dayOfWeek: s.getDay() - new DayPilot.Date(startDate).getDay(),
        openTime:  s.toString("HH:mm:ss"),
        closeTime: ee.toString("HH:mm:ss"),
      };
    });
    try {
      const res = await fetch(
        `${API_DOMAIN}/venues/${venueId}/courts/${courtId}/opening-hours/bulk`,
        {
          method: 'POST',
          headers: {
            'Content-Type':'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ periods: periodsDto })
        }
      );
      if (!res.ok) throw new Error(`Error ${res.status}`);
      alert("所有時段已儲存");
    } catch (err) {
      alert(`儲存失敗：${err.message}`);
    }
  };

  // Back handler
  const handleBack = () => navigate(`/venues/${venueId}/courts`);

  return (
    <div style={{ padding: 10, position: 'relative' }}>
      {/* Save & Back buttons */}
      <div style={{ marginBottom: 8, textAlign: 'right' }}>
        <button onClick={handleBack} style={{ marginRight: 8 }}>
          ← 回管理球場
        </button>
        <button
          onClick={handleSave}
          style={{ background: '#28a745', color: '#fff' }}
        >
          儲存時段
        </button>
      </div>

      {/* Navigator overlay */}
      {showNav && (
        <div style={{
          position: 'absolute',
          top: 45, right: 10,
          zIndex: 10,
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          <DayPilotNavigator
            selectMode="Week"
            showMonths={1}
            skipMonths={1}
            selectionDay={startDate}
            onTimeRangeSelected={args => {
              setStartDate(args.day.toString("yyyy-MM-dd"));
              setShowNav(false);
            }}
          />
        </div>
      )}

      {/* Calendar */}
      <DayPilotCalendar {...config} controlRef={c => setCalendar(c)} />
    </div>
  );
}
