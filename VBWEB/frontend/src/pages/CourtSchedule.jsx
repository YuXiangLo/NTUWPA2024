import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_DOMAIN } from '../config.js';
import './CourtSchedule.css';

function generateTimeSlots(startHour = 9, endHour = 22) {
  const slots = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    const formatted = hour > 12 ? hour - 12 : hour;
    const suffix = hour >= 12 ? 'PM' : 'AM';
    slots.push({ label: `${formatted}:00 ${suffix}`, hour });
  }
  return slots;
}

const daysOfWeek = [
  { dayName: 'Sun', date: '2025-04-13' },
  { dayName: 'Mon', date: '2025-04-14' },
  { dayName: 'Tue', date: '2025-04-15' },
  { dayName: 'Wed', date: '2025-04-16' },
  { dayName: 'Thu', date: '2025-04-17' },
  { dayName: 'Fri', date: '2025-04-18' },
  { dayName: 'Sat', date: '2025-04-19' },
];

const SchedulePage = () => {
  const { court_id } = useParams();
  const navigate = useNavigate();
  const [courtDetail, setCourtDetail] = useState(null);
  const [loadingCourt, setLoadingCourt] = useState(true);
  const [courtError, setCourtError] = useState(null);

  const [timeSlots, setTimeSlots] = useState([]);
  const [slotStatus, setSlotStatus] = useState({});
  const [selectedSlots, setSelectedSlots] = useState([]);

  const [curMale, setCurMale] = useState(0);
  const [maxMale, setMaxMale] = useState(0);
  const [curFemale, setCurFemale] = useState(0);
  const [maxFemale, setMaxFemale] = useState(0);
  const [privacy, setPrivacy] = useState('public');
  const [level, setLevel] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const currentURL = () =>
    window.location.pathname + window.location.search;
  const loggedIn = () => Boolean(localStorage.getItem('user'));

  // Fetch court & venue info
  useEffect(() => {
    fetch(`${API_DOMAIN}courts/court-venue-name/${court_id}`)
      .then(res => res.ok ? res.json() : Promise.reject('Fetch failed'))
      .then(setCourtDetail)
      .catch(err => setCourtError(err))
      .finally(() => setLoadingCourt(false));
  }, [court_id]);

  // Init calendar
  useEffect(() => {
    const slots = generateTimeSlots();
    setTimeSlots(slots);
    const status = {};
    daysOfWeek.forEach((_, d) =>
      slots.forEach(({ hour }) => (status[`${d}_${hour}`] = 'available'))
    );
    setSlotStatus(status);
  }, [court_id]);

  const handleSlotClick = (day, { label, hour }) => {
    if (!loggedIn()) {
      alert('請先登錄會員');
      return navigate(`/login?redirect=${encodeURIComponent(currentURL())}`);
    }
    const key = `${day}_${hour}`;
    setSlotStatus(s => {
      if (s[key] === 'booked') {
        alert('此時間段已預約！');
        return s;
      }
      const next = s[key] === 'selected' ? 'available' : 'selected';
      return { ...s, [key]: next };
    });
    setSelectedSlots(slots => {
      const exists = slots.find(s => s.day === day && s.hour === hour);
      if (exists) {
        return slots.filter(s => !(s.day === day && s.hour === hour));
      }
      return [...slots, { day, hour, label }];
    });
  };

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
      user_id: JSON.parse(localStorage.getItem('user')).userid,
      venue_id: courtDetail.venue.venue_id,
      court_id,
      slots: selectedSlots.map(s => ({
        date: daysOfWeek[s.day].date,
        time: `${s.hour}:00`,
      })),
      cur_male_count: curMale,
      max_male_count: maxMale,
      cur_female_count: curFemale,
      max_female_count: maxFemale,
      privacy_type: privacy,
      level,
    };

    try {
      const res = await fetch(`${API_DOMAIN}reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error('提交失敗');
      alert('預約成功！');
      navigate('/venues');
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
                <th key={i}>{d.dayName}<br />{d.date}</th>
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
                      onClick={() => handleSlotClick(dayIndex, slot)}
                    >
                      {status === 'booked' ? '✕' :
                       status === 'selected' ? '✓' : ''}
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
          {selectedSlots
            .map(s => `${daysOfWeek[s.day].date} ${s.label}`)
            .join('；')}
        </div>
      )}

      <form className="reserve-form" onSubmit={handleSubmit}>
        <h3>填寫預約詳情</h3>
        {errorMsg && <div className="form-error">{errorMsg}</div>}

        <div className="form-row">
          <div className="form-field">
            <label>當前男生人數</label>
            <input
              type="number"
              min="0"
              value={curMale}
              onChange={e => setCurMale(+e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>最大男生人數</label>
            <input
              type="number"
              min="0"
              value={maxMale}
              onChange={e => setMaxMale(+e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label>當前女生人數</label>
            <input
              type="number"
              min="0"
              value={curFemale}
              onChange={e => setCurFemale(+e.target.value)}
            />
          </div>
          <div className="form-field">
            <label>最大女生人數</label>
            <input
              type="number"
              min="0"
              value={maxFemale}
              onChange={e => setMaxFemale(+e.target.value)}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field full">
            <label>公開／私人</label>
            <select
              value={privacy}
              onChange={e => setPrivacy(e.target.value)}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-field full">
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
