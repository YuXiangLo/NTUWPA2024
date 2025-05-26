// src/pages/CustomReservationPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { API_DOMAIN } from '../../config';

export default function CustomReservationPage() {
  const { user } = useAuth();
  const token = user?.accessToken;
  const navigate = useNavigate();

  const [form, setForm] = useState({
    venueName: '',
    address: '',
    courtName: '',
    courtProperty: '',
    startDate: '',
    startTime: '',
    endTime: '',
    numPlayers: 1,
    fee: '',
    visibility: 'public',
    detail: '',
  });
  const [statusMsg, setStatusMsg] = useState('');

  const onChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const {
      venueName,
      address,
      courtName,
      courtProperty,
      startDate, startTime,
      endTime,
      numPlayers, fee,
      visibility, detail
    } = form;
    if (!address || !startDate || !startTime || !endTime) {
      setStatusMsg('請填寫所有必填項目');
      return;
    }

    const startTs = `${startDate}T${startTime}`;
    const endTs   = `${startDate}T${endTime}`;

    // build payload, only include optional fields if non-empty
    const payload = {
      start_ts:    startTs,
      end_ts:      endTs,
      num_players: parseInt(numPlayers, 10),
      visibility,
      venue_name: venueName? venueName : "",
      address,
      court_name: courtName? courtName : "",
      court_property: courtProperty? courtProperty : "",
      fee: fee? parseFloat(fee) : 0.0,
      detail: detail? detail : "",
    };

    try {
      const res = await fetch(`${API_DOMAIN}/custom-reservations`, {
        method: 'POST',
        headers: {
          'Content-Type':'application/json',
          Authorization:`Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || `Error ${res.status}`);
      }
      const data = await res.json();
      navigate(`/`);
    } catch(err) {
      setStatusMsg(`建立失敗：${err.message}`);
    }
  };

  return (
    <div className="app-card-page" style={{ maxWidth: 600 }}>
      <h2>自訂建立預約</h2>
      <form className="app-form-group" onSubmit={handleSubmit}>
        <label>
          場地名稱（選填）
          <input 
            className='app-input'
            type="text"
            name="venueName"
            value={form.venueName}
            onChange={onChange}
          />
        </label>

        <label className = "app-form-group">
          地址 *
          <input
            className='app-input'
            type="text"
            name="address"
            value={form.address}
            onChange={onChange}
            required
          />
        </label>

        <label className = "app-form-group">
          球場名稱（選填）
          <input
            className='app-input'
            type="text"
            name="courtName"
            value={form.courtName}
            onChange={onChange}
          />
        </label>

        <label className = "app-form-group">
          球場屬性（選填）
          <input
            className='app-input'
            type="text"
            name="courtProperty"
            value={form.courtProperty}
            onChange={onChange}
          />
        </label>

        <label className = "app-form-group">
          日期 *
          <input
            className='app-input'
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
            required
          />
        </label>

        <label className = "app-form-group">
          開始時間 *
          <input
            className='app-input'
            type="time"
            name="startTime"
            value={form.startTime}
            onChange={onChange}
            required
          />
        </label>

        <label className = "app-form-group">
          結束時間 *
          <input
            className='app-input'
            type="time"
            name="endTime"
            value={form.endTime}
            onChange={onChange}
            required
          />
        </label>

        <label className = "app-form-group">
          人數 *
          <input
            className='app-input'
            type="number"
            name="numPlayers"
            min="1"
            value={form.numPlayers}
            onChange={onChange}
            required
          />
        </label>

        <label className = "app-form-group">
          費用（選填）
          <input
            className='app-input'
            type="number"
            name="fee"
            min="0"
            step="0.01"
            value={form.fee}
            onChange={onChange}
          />
        </label>

        <label className = "app-form-group">
          可見性 *
          <select
            name="visibility"
            value={form.visibility}
            onChange={onChange}
          >
            <option value="public">公開</option>
            <option value="friend">好友</option>
            <option value="private">私密</option>
          </select>
        </label>

        <label className = "app-form-group">
          詳細說明（選填）
          <textarea
            className='app-input'
            name="detail"
            value={form.detail}
            onChange={onChange}
          />
        </label>

        <button type="submit" className="app-btn">建立預約</button>
        {statusMsg && <p className="app-error">{statusMsg}</p>}
      </form>
    </div>
  );
}
