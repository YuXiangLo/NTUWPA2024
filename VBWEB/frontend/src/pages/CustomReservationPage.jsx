// src/pages/CustomReservationPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_DOMAIN } from '../config';
import './CustomReservationPage.css';

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
    <div className="custom-res-page">
      <h2>自訂建立預約</h2>
      <form className="custom-res-form" onSubmit={handleSubmit}>
        <label>
          場地名稱（選填）
          <input
            type="text"
            name="venueName"
            value={form.venueName}
            onChange={onChange}
          />
        </label>

        <label>
          地址 *
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={onChange}
            required
          />
        </label>

        <label>
          球場名稱（選填）
          <input
            type="text"
            name="courtName"
            value={form.courtName}
            onChange={onChange}
          />
        </label>

        <label>
          球場屬性（選填）
          <input
            type="text"
            name="courtProperty"
            value={form.courtProperty}
            onChange={onChange}
          />
        </label>

        <label>
          日期 *
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={onChange}
            required
          />
        </label>
        <label>
          開始時間 *
          <input
            type="time"
            name="startTime"
            value={form.startTime}
            onChange={onChange}
            required
          />
        </label>

        <label>
          結束時間 *
          <input
            type="time"
            name="endTime"
            value={form.endTime}
            onChange={onChange}
            required
          />
        </label>

        <label>
          人數 *
          <input
            type="number"
            name="numPlayers"
            min="1"
            value={form.numPlayers}
            onChange={onChange}
            required
          />
        </label>

        <label>
          費用（選填）
          <input
            type="number"
            name="fee"
            min="0"
            step="0.01"
            value={form.fee}
            onChange={onChange}
          />
        </label>

        <label>
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

        <label>
          詳細說明（選填）
          <textarea
            name="detail"
            value={form.detail}
            onChange={onChange}
          />
        </label>

        <button type="submit">建立預約</button>
        {statusMsg && <p className="status">{statusMsg}</p>}
      </form>
    </div>
  );
}
