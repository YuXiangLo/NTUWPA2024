// src/pages/ManageSchedule.jsx
// Integrates the DayPilot demo UndoService to give a single-step “automatic undo”
// whenever an overlap is detected or the PATCH/POST/DELETE call fails.

import React, { useEffect, useState, useRef } from 'react';
import {
  DayPilot,
  DayPilotCalendar,
  DayPilotNavigator
} from '@daypilot/daypilot-lite-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_DOMAIN } from '../../config';

/**********************************************************************
 * Lightweight UndoService (adapted from
 * https://code.daypilot.org/30113/react-scheduler-how-to-enable-undo-redo)
 *********************************************************************/
class UndoService {
  constructor() {
    this._items = {};   // id -> JSON string of event
    this._history = []; // ordered stack of operations
    this._pos = 0;      // cursor in _history (0 … length)
  }
  _key(id) {
    return String(id);
  }
  _push(rec) {
    // truncate any “redo” tail and push new record
    this._history = this._history.slice(0, this._pos);
    this._history.push(rec);
    this._pos = this._history.length;
  }
  /* ---------- public API ---------- */
  initialize(initial = []) {
    this._items = {};
    initial.forEach(ev => {
      this._items[this._key(ev.id)] = JSON.stringify(ev);
    });
    this._history = [];
    this._pos = 0;
  }
  add(item, note = '') {
    this._items[this._key(item.id)] = JSON.stringify(item);
    this._push({ type: 'add', id: item.id, current: item, text: note });
  }
  update(item, note = '') {
    const k = this._key(item.id);
    const prev = JSON.parse(this._items[k]);
    this._items[k] = JSON.stringify(item);
    this._push({ type: 'update', id: item.id, previous: prev, current: item, text: note });
  }
  remove(item, note = '') {
    const k = this._key(item.id);
    const prev = JSON.parse(this._items[k] || '{}');
    delete this._items[k];
    this._push({ type: 'remove', id: item.id, previous: prev, text: note });
  }
  get canUndo() {
    return this._pos > 0;
  }
  undo() {
    if (!this.canUndo) return null;
    this._pos -= 1;
    const rec = this._history[this._pos];
    const k = this._key(rec.id);
    switch (rec.type) {
      case 'add':
        delete this._items[k];
        break;
      case 'remove':
        this._items[k] = JSON.stringify(rec.previous);
        break;
      case 'update':
        this._items[k] = JSON.stringify(rec.previous);
        break;
      default:
        break;
    }
    return rec; // caller can inspect rec.previous to restore UI
  }
}

/**********************************************************************
 * ManageCourtSchedule Component
 *********************************************************************/
export default function ManageCourtSchedule() {
  const { venueId, courtId } = useParams();
  const { user } = useAuth();
  const token = user?.accessToken;
  const navigate = useNavigate();

  const [calendar, setCalendar] = useState(null);
  const [events, setEvents] = useState([]);
  const [startDate, setStartDate] = useState(
    new DayPilot.Date().firstDayOfWeek().toString('yyyy-MM-dd')
  );
  const [showNav, setShowNav] = useState(false);

  /* Undo service lives in a ref so its instance survives re-renders */
  const undoService = useRef(new UndoService()).current;

  /* ---------- helpers ---------- */
  const toPlain = ev => ({
    id: ev.id,
    start: new DayPilot.Date(ev.start).toString(),
    end: new DayPilot.Date(ev.end).toString(),
    text: ev.text
  });

  const hasOverlap = (s, e, excludeId = null) =>
    events.some(ev => {
      if (excludeId && ev.id === excludeId) return false;
      const es = new DayPilot.Date(ev.start).getTime();
      const ee = new DayPilot.Date(ev.end).getTime();
      return s.getTime() < ee && es < e.getTime();
    });

  /* ---------- initial load ---------- */
  useEffect(() => {
    if (!token || !calendar) return;
    fetch(
      `${API_DOMAIN}/venues/${venueId}/courts/${courtId}/opening-hours`,
      { headers: { Authorization: `Bearer ${token}` } }
    )
      .then(r => r.json())
      .then(data => {
        const evs = data.map(rec => {
          const base = new DayPilot.Date(startDate).addDays(rec.day_of_week);
          const iso = base.toString('yyyy-MM-dd');
          return {
            id: rec.id,
            start: new DayPilot.Date(`${iso}T${rec.open_time}`),
            end: new DayPilot.Date(`${iso}T${rec.close_time}`),
            text: `${rec.open_time}–${rec.close_time}`
          };
        });
        setEvents(evs);
        undoService.initialize(evs.map(toPlain));
      })
      .catch(console.error);
  }, [token, calendar, startDate, venueId, courtId, undoService]);

  /* ---------- ADD ---------- */
  const handleAdd = async args => {
    calendar.clearSelection();
    const s = new DayPilot.Date(args.start);
    const e = new DayPilot.Date(args.end);
    if (hasOverlap(s, e)) {
      alert('時間重疊，無法新增');
      return;
    }
    const dayOfWeek = s.getDay() - new DayPilot.Date(startDate).getDay();
    const openTime = s.toString('HH:mm:ss');
    const closeTime = e.toString('HH:mm:ss');

    try {
      const res = await fetch(
        `${API_DOMAIN}/venues/${venueId}/courts/${courtId}/opening-hours`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ dayOfWeek, openTime, closeTime })
        }
      );
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const created = await res.json();
      const ev = { id: created.id, start: s, end: e, text: `${openTime}–${closeTime}` };
      calendar.events.add(ev);
      setEvents(prev => [...prev, ev]);
      undoService.add(toPlain(ev), '新增');
    } catch (err) {
      alert(`新增失敗：${err.message}`);
    }
  };

  /* ---------- MOVE ---------- */
  const handleMove = async args => {
    const { e } = args;
    const s = new DayPilot.Date(e.data.start);
    const eEnd = new DayPilot.Date(e.data.end);
    undoService.update(toPlain(e.data), '移動');

    if (hasOverlap(s, eEnd, e.data.id)) {
      alert('時間重疊，無法移動');
      const act = undoService.undo();
      e.data.start = new DayPilot.Date(act.previous.start);
      e.data.end = new DayPilot.Date(act.previous.end);
      calendar.events.update(e);
      return;
    }

    const dayOfWeek = s.getDay() - new DayPilot.Date(startDate).getDay();
    const openTime = s.toString('HH:mm:ss');
    const closeTime = eEnd.toString('HH:mm:ss');

    try {
      const res = await fetch(
        `${API_DOMAIN}/venues/${venueId}/courts/${courtId}/opening-hours/${e.data.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ dayOfWeek, openTime, closeTime })
        }
      );
      if (!res.ok) throw new Error(`Error ${res.status}`);
      e.data.text = `${openTime}–${closeTime}`;
      calendar.events.update(e);
      setEvents(prev =>
        prev.map(ev =>
          ev.id === e.data.id ? { ...ev, start: s, end: eEnd, text: e.data.text } : ev
        )
      );
    } catch (err) {
      alert(`更新失敗：${err.message}`);
      const act = undoService.undo();
      e.data.start = new DayPilot.Date(act.previous.start);
      e.data.end = new DayPilot.Date(act.previous.end);
      calendar.events.update(e);
    }
  };

  /* ---------- RESIZE ---------- */
  const handleResize = async args => {
    const { e } = args;
    const s = new DayPilot.Date(e.data.start);
    const eEnd = new DayPilot.Date(e.data.end);
    undoService.update(toPlain(e.data), '調整長度');

    if (hasOverlap(s, eEnd, e.data.id)) {
      alert('時間重疊，無法調整長度');
      const act = undoService.undo();
      e.data.start = new DayPilot.Date(act.previous.start);
      e.data.end = new DayPilot.Date(act.previous.end);
      calendar.events.update(e);
      return;
    }

    const dayOfWeek = s.getDay() - new DayPilot.Date(startDate).getDay();
    const openTime = s.toString('HH:mm:ss');
    const closeTime = eEnd.toString('HH:mm:ss');

    try {
      const res = await fetch(
        `${API_DOMAIN}/venues/${venueId}/courts/${courtId}/opening-hours/${e.data.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ dayOfWeek, openTime, closeTime })
        }
      );
      if (!res.ok) throw new Error(`Error ${res.status}`);
      e.data.text = `${openTime}–${closeTime}`;
      calendar.events.update(e);
      setEvents(prev =>
        prev.map(ev =>
          ev.id === e.data.id ? { ...ev, start: s, end: eEnd, text: e.data.text } : ev
        )
      );
    } catch (err) {
      alert(`更新失敗：${err.message}`);
      const act = undoService.undo();
      e.data.start = new DayPilot.Date(act.previous.start);
      e.data.end = new DayPilot.Date(act.previous.end);
      calendar.events.update(e);
    }
  };

  /* ---------- EDIT / DELETE (modal) ---------- */
  const editEvent = async evArgs => {
    if (!calendar) return;
    const data = evArgs.data;
    const weekdays = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const options = weekdays.map((w,i) => ({ name: w, id: i }));

    const form = [
      { name: 'Weekday:',           id: 'dayOfWeek', type: 'select', options },
      { name: 'Open Time:',         id: 'openTime',  type: 'text'   },
      { name: 'Close Time:',        id: 'closeTime', type: 'text'   },
      { name: 'Delete this period', id: 'delete',    type: 'checkbox' }
    ];

    const currStart = new DayPilot.Date(data.start);
    const currEnd   = new DayPilot.Date(data.end);
    const seed = {
      dayOfWeek: currStart.getDay() - new DayPilot.Date(startDate).getDay(),
      openTime:  currStart.toString('HH:mm:ss'),
      closeTime: currEnd.toString('HH:mm:ss')
    };

    const modal = await DayPilot.Modal.form(form, seed);
    if (modal.canceled) return;
    const res = modal.result;

    /* ---- DELETE ---- */
    if (res.delete) {
      try {
        const del = await fetch(
          `${API_DOMAIN}/venues/${venueId}/courts/${courtId}/opening-hours/${data.id}`,
          { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } }
        );
        if (!del.ok) throw new Error(`Error ${del.status}`);
        calendar.events.remove(evArgs);
        setEvents(prev => prev.filter(ev => ev.id !== data.id));
        undoService.remove(toPlain(data), '刪除');
      } catch (err) {
        alert(`刪除失敗：${err.message}`);
      }
      return;
    }

    /* ---- UPDATE ---- */
    const base = new DayPilot.Date(startDate).addDays(res.dayOfWeek);
    const newStart = new DayPilot.Date(`${base.toString('yyyy-MM-dd')}T${res.openTime}`);
    const newEnd   = new DayPilot.Date(`${base.toString('yyyy-MM-dd')}T${res.closeTime}`);

    undoService.update(toPlain({ ...data, start: newStart, end: newEnd }), '編輯');

    if (hasOverlap(newStart, newEnd, data.id)) {
      alert('時間重疊，無法修改');
      undoService.undo();
      return;
    }

    try {
      const upd = await fetch(
        `${API_DOMAIN}/venues/${venueId}/courts/${courtId}/opening-hours/${data.id}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            dayOfWeek: res.dayOfWeek,
            openTime : res.openTime,
            closeTime: res.closeTime
          })
        }
      );
      if (!upd.ok) throw new Error(`Error ${upd.status}`);
      data.start = newStart;
      data.end   = newEnd;
      data.text  = `${res.openTime}–${res.closeTime}`;
      calendar.events.update(evArgs);
      setEvents(prev => prev.map(ev => ev.id === data.id ? { ...ev, ...data } : ev));
    } catch (err) {
      alert(`更新失敗：${err.message}`);
      undoService.undo();
    }
  };

  /* ---------- BULK SAVE ---------- */
  const handleSave = async () => {
    const dto = events.map(ev => {
      const s = new DayPilot.Date(ev.start);
      const ee = new DayPilot.Date(ev.end);
      return {
        dayOfWeek: s.getDay() - new DayPilot.Date(startDate).getDay(),
        openTime : s.toString('HH:mm:ss'),
        closeTime: ee.toString('HH:mm:ss')
      };
    });
    try {
      const res = await fetch(
        `${API_DOMAIN}/venues/${venueId}/courts/${courtId}/opening-hours/bulk`,
        {
          method: 'POST',
          headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ periods: dto })
        }
      );
      if (!res.ok) throw new Error(`Error ${res.status}`);
      alert('所有時段已儲存');
    } catch (err) {
      alert(`儲存失敗：${err.message}`);
    }
  };

  /* ---------- NAVIGATE BACK ---------- */
  const handleBack = () => navigate(`/venues/${venueId}/courts`);

  /* ---------- calendar config ---------- */
  const config = {
    viewType: 'Week',
    weekStarts: 0,            // Sunday
    headerDateFormat: 'dddd',
    durationBarVisible: false,
    timeRangeSelectedHandling: 'Enabled',
    onTimeRangeSelected: handleAdd,
    onEventMoved:   handleMove,
    onEventResized: handleResize,
    onEventClick:   args => editEvent(args.e),
    events,
    startDate
  };

  /* ---------- JSX ---------- */
  return (
    <div style={{ padding: 10, position: 'relative' }}>
      {/* Save & Back */}
      <div style={{ marginBottom: 8, textAlign: 'right' }}>
        <button onClick={handleBack} style={{ marginRight: 8 }}>← 回管理球場</button>
        <button onClick={handleSave} style={{ background: '#28a745', color: '#fff' }}>
          儲存時段
        </button>
      </div>

      {/* Small Navigator overlay */}
      {showNav && (
        <div style={{
          position: 'absolute',
          top: 45, right: 10,
          zIndex: 10,
          background: '#fff',
          boxShadow: '0 2px 8px rgba(0,0,0,.2)'
        }}>
          <DayPilotNavigator
            selectMode="Week"
            showMonths={1}
            skipMonths={1}
            selectionDay={startDate}
            onTimeRangeSelected={args => {
              setStartDate(args.day.toString('yyyy-MM-dd'));
              setShowNav(false);
            }}
          />
        </div>
      )}

      {/* Calendar itself */}
      <DayPilotCalendar {...config} controlRef={c => setCalendar(c)} />
    </div>
  );
}
