// src/pages/SchedulePage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_DOMAIN } from '../config.js';
import './CourtSchedule.css';

// Generate hourly slots from startHour to endHour
function generateTimeSlots(startHour = 9, endHour = 22) {
  const slots = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    const labelHour = hour > 12 ? hour - 12 : hour;
    const suffix = hour >= 12 ? 'PM' : 'AM';
    slots.push({ label: `${labelHour}:00 ${suffix}`, hour });
  }
  return slots;
}

// Generate days from offsetStart to offsetEnd relative to today
function generateDays(offsetStart = -1, offsetEnd = 5) {
  const days = [];
  const today = new Date();
  for (let offset = offsetStart; offset <= offsetEnd; offset++) {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    days.push({ dayName, date: `${mm}-${dd}`, iso: d.toISOString().slice(0, 10) });
  }
  return days;
}

const SchedulePage = () => {
  const { court_id } = useParams();
  const navigate = useNavigate();

  const daysOfWeek = useMemo(() => generateDays(-1, 5), []);

  // Court & venue info
  const [courtDetail, setCourtDetail] = useState(null);
  const [loadingCourt, setLoadingCourt] = useState(true);
  const [courtError, setCourtError] = useState(null);

  // Calendar state
  const [timeSlots, setTimeSlots] = useState([]);
  const [slotStatus, setSlotStatus] = useState({});
  const [selectedSlots, setSelectedSlots] = useState([]);

  // Reservation form state
  const [curMale, setCurMale] = useState(0);
  const [maxMale, setMaxMale] = useState(0);
  const [curFemale, setCurFemale] = useState(0);
  const [maxFemale, setMaxFemale] = useState(0);
  const [privacy, setPrivacy] = useState('public');
  const [level, setLevel] = useState('0');
  const [fee, setFee] = useState(0.0);
  const [remark, setRemark] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const currentURL = () => window.location.pathname + window.location.search;
  const loggedIn = () => Boolean(localStorage.getItem('user'));

  // Fetch court & venue info
  useEffect(() => {
    fetch(`${API_DOMAIN}courts/court-venue-name/${court_id}`)
      .then(res => res.ok ? res.json() : Promise.reject('Fetch failed'))
      .then(setCourtDetail)
      .catch(setCourtError)
      .finally(() => setLoadingCourt(false));
  }, [court_id]);

  // Initialize slots & fetch existing bookings
  useEffect(() => {
    const slots = generateTimeSlots();
    setTimeSlots(slots);

    const statusMap = {};
    daysOfWeek.forEach((day, dayIndex) =>
      slots.forEach(({ hour }) => statusMap[`${dayIndex}_${hour}`] = 'available')
    );

    const startIso = daysOfWeek[0].iso;
    const endIso = daysOfWeek[daysOfWeek.length - 1].iso;
    
    fetch(
      `${API_DOMAIN}reserve/court/${court_id}` +
        `?start=${startIso}&end=${endIso}`
    )
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(bookings => {
        console.log('Bookings:', bookings);
        bookings.forEach(({ start_time, user_id }) => {
          const dt = new Date(start_time);
          const dayIdx = daysOfWeek.findIndex(
            d => d.iso === dt.toISOString().slice(0,10)
          );
          const hour = dt.getUTCHours();
          const key = `${dayIdx}_${hour}`;
          if (statusMap[key] !== undefined) {
            statusMap[key] =
              (user_id === JSON.parse(localStorage.getItem('user')).userID) ? 'own' : 'booked';
          }
        });
        setSlotStatus(statusMap);
      })
      .catch(() => {
        setSlotStatus(statusMap);
      });
  }, [court_id, daysOfWeek]);

  // Toggle slot selection
  const handleSlotClick = (dayIndex, { label, hour }) => {
    const key = `${dayIndex}_${hour}`;
    const status = slotStatus[key];
    if (status === 'booked' || status === 'own') {
      alert('此時間段已預約！');
      return;
    }
    if (!loggedIn()) {
      alert('請先登錄會員');
      return navigate(`/login?redirect=${encodeURIComponent(currentURL())}`);
    }

    // Toggle status
    setSlotStatus(prev => ({
      ...prev,
      [key]: prev[key] === 'selected' ? 'available' : 'selected'
    }));

    // Toggle selection in list
    setSelectedSlots(prev => {
      return prev.some(s => s.day === dayIndex && s.hour === hour)
        ? prev.filter(s => !(s.day === dayIndex && s.hour === hour))
        : [...prev, { day: dayIndex, hour, label }];
    });
  };

  // Submit reservation
  const handleSubmit = async e => {
    e.preventDefault();
    setErrorMsg('');
    if (!loggedIn()) {
      alert('請先登錄會員');
      return navigate(`/login?redirect=${encodeURIComponent(currentURL())}`);
    }
    if (selectedSlots.length === 0) {
      return setErrorMsg('請選擇至少一個時間段');
    }
    if (curMale > maxMale || curFemale > maxFemale) {
      return setErrorMsg('當前人數不能超過最大人數');
    }

    const body = {
      user_id: JSON.parse(localStorage.getItem('user')).userID,
      venue_id: courtDetail.venue.venue_id,
      court_id,
      slots: selectedSlots.map(s => ({
        date: daysOfWeek[s.day].iso,
        time: `${s.hour}:00`
      })),
      cur_male_count: curMale,
      max_male_count: maxMale,
      cur_female_count: curFemale,
      max_female_count: maxFemale,
      privacy_type: privacy,
      level,
      fee: parseFloat(fee),
      remark
    };
    console.log(body);
    try {
      const res = await fetch(`${API_DOMAIN}reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('提交失敗');
      alert('預約成功！');
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  if (loadingCourt) return <div className="loading">Loading court…</div>;
  if (courtError) return <div className="error">Error: {courtError}</div>;

  return (
    <div className="booking-calendar-container">
      <h2 className="page-title">
        {courtDetail.venue.name} — {courtDetail.name}
      </h2>

      <div className="calendar-wrapper">
        <table className="booking-calendar-table">
          <thead>
            <tr>
              <th>Time</th>
              {daysOfWeek.map((d, i) => (
                <th key={i}>{d.dayName}<br/>{d.date}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {timeSlots.map(slot => (
              <tr key={slot.hour}>
                <td className="time-label">{slot.label}</td>
                {daysOfWeek.map((_, dayIndex) => {
                  const key = `${dayIndex}_${slot.hour}`;
                  const status = slotStatus[key];
                  return (
                    <td
                      key={key}
                      className={`slot-cell ${status}`}
                      onClick={e => {
                        e.stopPropagation();
                        handleSlotClick(dayIndex, slot);
                      }}
                    >
                      {status === 'booked' ? '✕' :
                       status === 'selected' ? '✓' : 
                       status === 'own' ? '✓' : ''}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedSlots.length > 0 && (
        <div className="selected-summary">
          <strong>已選時間：</strong>
          {selectedSlots.map(s => `${daysOfWeek[s.day].date} ${s.label}`).join('；')}
        </div>
      )}

      <form className="reserve-form" onSubmit={handleSubmit}>
        <h3>填寫預約詳情</h3>
        {errorMsg && <div className="form-error">{errorMsg}</div>}

        <div className="form-row">
          <div className="form-field">
            <label>當前男生人數</label>
            <input
              type="number" min="0"
              value={curMale} onChange={e => setCurMale(+e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>最大男生人數</label>
            <input
              type="number" min="0"
              value={maxMale} onChange={e => setMaxMale(+e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>當前女生人數</label>
            <input
              type="number" min="0"
              value={curFemale} onChange={e => setCurFemale(+e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>最大女生人數</label>
            <input
              type="number" min="0"
              value={maxFemale} onChange={e => setMaxFemale(+e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>費用 (Fee)</label>
            <input
              type="number" min="0" step="0.01"
              value={fee} onChange={e => setFee(e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>備註 (Remark)</label>
            <textarea
              value={remark}
              onChange={e => setRemark(e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>公開／私人</label>
            <select value={privacy} onChange={e => setPrivacy(e.target.value)}>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div className="form-field">
            <label>Level</label>
            <input
              type="text"
              value={level}
              onChange={e => setLevel(e.target.value)}
            />
          </div>
        </div>

        <button type="submit" className="confirm-button">
          提交預約
        </button>
      </form>
    </div>
  );
};

export default SchedulePage;
