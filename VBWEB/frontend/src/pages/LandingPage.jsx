import React, { useContext, useEffect, useRef, useState } from 'react';
import './LandingPage.css';
import { useNavigate } from 'react-router-dom';
import { LandmarkProvider, LandmarkContext } from '../context/LandmarkContext.jsx';
import TaipeiMap from '../components/TaipeiMap.jsx';
import LandmarkList from '../components/LandmarkList.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { API_DOMAIN } from '../config.js';

function LandingPageInner() {
  const { user } = useAuth();               // assume user.id exists
  const [myRes, setMyRes] = useState([]);
  const [loadingRes, setLoadingRes] = useState(false);
  const [errRes, setErrRes] = useState(null);
  const navigate = useNavigate();
  const { setAddCourtMode, addCourtMode } = useContext(LandmarkContext);
  const mapContainerRef = useRef(null);

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setAddCourtMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setAddCourtMode]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (addCourtMode && mapContainerRef.current && !mapContainerRef.current.contains(e.target)) {
        setAddCourtMode(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [addCourtMode, setAddCourtMode]);

  useEffect(() => {
    if (!user?.id) return;
    console.log("user.id: ", user.id);
    // Fetch user's reservations  
    setLoadingRes(true);
    fetch(`${API_DOMAIN}reserve/user/${user.id}`)
      .then(r => { if (!r.ok) throw Error(r.statusText); return r.json() })
      .then(data => setMyRes(data))
      .catch(e => setErrRes(e.message))
      .finally(() => setLoadingRes(false));
  }, [user]);

  return (
    <div className="landing-page">
      <main className="landing-main">
        <div className="map-container" ref={mapContainerRef}>
          {addCourtMode && (
            <div className="add-court-hint">
              請在地圖上點一下以新增場館
            </div>
          )}
          <TaipeiMap />
          <section style={{ marginTop: 20 }}>
            <h3>Your Upcoming Reservations</h3>
            {loadingRes && <p>Loading…</p>}
            {errRes && <p style={{color:'red'}}>{errRes}</p>}
            {!loadingRes && !errRes && (
              <table className="reservation-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Venue</th>
                    <th>Court</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {myRes.map((r,i) => {
                    const s = new Date(r.start_time);
                    const e = new Date(r.end_time);
                    return (
                      <tr key={i}>
                        <td>{s.toLocaleDateString()}</td>
                        <td>{r.venue_id}</td>
                        <td>{r.court_id}</td>
                        <td>
                          {s.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
                          {' – '}
                          {e.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </section>
        </div>

        <aside className={`sidebar ${addCourtMode ? 'dimmed' : ''}`}>
          <button className="sidebar-btn" onClick={() => navigate("/search-venue")}>
            搜尋場地
          </button>
          <button className="sidebar-btn" onClick={() => navigate("/GameSignup")}>報名比賽</button>
          <button className="sidebar-btn" onClick={() => navigate("/GameCreation")}>新增比賽</button>
          <button className="sidebar-btn" onClick={() => setAddCourtMode(true)}>
            新增場館
          </button>
          <LandmarkList />
        </aside>
      </main>
    </div>
  );
}

function LandingPage() {
  return (
    <LandmarkProvider>
      <LandingPageInner />
    </LandmarkProvider>
  );
}

export default LandingPage;
