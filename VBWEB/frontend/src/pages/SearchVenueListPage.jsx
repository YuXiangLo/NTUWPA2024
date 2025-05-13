import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './SearchVenueListPage.css';
import { API_DOMAIN } from '../config.js';

const SearchVenueListPage = () => {
  // Search/filter states
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  // Fetched venues and loading/error states
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  // Track expanded venue (toggle state)
  const [toggledVenues, setToggledVenues] = useState({});
  // State to display the "scroll-to-top" button
  const [showToTop, setShowToTop] = useState(false);

  // Fetch data from backend API once the component mounts
  useEffect(() => {
    setLoading(true);
    fetch(`${API_DOMAIN}/venues`)
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setVenues(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Listen to scroll event to show/hide the "to-top" button
  useEffect(() => {
    const handleScroll = () => {
      if (window.pageYOffset > 200) {
        setShowToTop(true);
      } else {
        setShowToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top of the page
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle the display of a venue's courts
  const toggleVenue = (venueId) => {
    setToggledVenues((prev) => ({
      ...prev,
      [venueId]: !prev[venueId],
    }));
  };

  // Filter venues using searchText and statusFilter
  const filteredVenues = venues.filter((venue) => {
    const keywordMatch =
      venue.name.toLowerCase().includes(searchText.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchText.toLowerCase());
    const statusMatch = statusFilter === 'all' || venue.status === statusFilter;
    return keywordMatch && statusMatch;
  });

  // Basic loading and error messages
  if (loading) {
    return <div className="svl-container">Loading...</div>;
  }
  if (error) {
    return <div className="svl-container">Error: {error}</div>;
  }

  return (
    <div className="svl-container">
      <h1 className="svl-title">搜尋場館</h1>

      <div className="svl-search-section">
        <input
          type="text"
          className="svl-search-input"
          placeholder="搜尋場館名稱或地址..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <select
          className="svl-search-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">全部狀態</option>
          <option value="open">開放</option>
          <option value="closed">關閉</option>
          <option value="test">test</option>
        </select>
      </div>

      {/* Header row for venues */}
      <div className="svl-header-row">
        <span className="svl-col svl-col-name">場館名稱</span>
        <span className="svl-col svl-col-address">地址</span>
        <span className="svl-col svl-col-count">場地數</span>
        <span className="svl-col svl-col-status">狀態</span>
        <span className="svl-col svl-col-actions">詳細資料</span>
      </div>

      <div className="svl-venue-list">
        {filteredVenues.length > 0 ? (
          filteredVenues.map((venue) => (
            <div key={venue.id} className="svl-venue-card">
              <div className="svl-venue-row">
                <span className="svl-col svl-col-name">{venue.name}</span>
                <span className="svl-col svl-col-address">{venue.address}</span>
                <span className="svl-col svl-col-count">
                  {venue.courts ? venue.courts.length : 0}
                </span>
                <span className="svl-col svl-col-status">{venue.status}</span>
                <span className="svl-col svl-col-actions">
                  <Link
                    to={`/venue/${venue.id}`}
                    className="svl-detail-button"
                  >
                    詳情
                  </Link>
                  <button
                    className="svl-toggle-button"
                    onClick={() => toggleVenue(venue.id)}
                  >
                    {toggledVenues[venue.id] ? '隱藏場地' : '顯示場地'}
                  </button>
                </span>
              </div>
              {toggledVenues[venue.id] && (
                <div className="svl-court-list">
                  {venue.courts && venue.courts.length > 0 ? (
                    venue.courts.map((court) => (
                      <div key={court.id} className="svl-court-card">
                        <div className="svl-court-info">
                          <span className="svl-court-name">{court.name}</span>
                          <span className="svl-court-material">
                            材質：{court.property}
                          </span>
                        </div>
                        <div className="svl-court-action">
                          <Link
                            to={`/venues/${venue.id}/courts/${court.id}/schedule`}
                            className="svl-detail-button"
                          >
                            詳情
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="svl-no-courts">暫無場地資訊</p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="svl-no-venues">查無資料</p>
        )}
      </div>

      {/* "Scroll to Top" Button */}
      {showToTop && (
        <button className="svl-to-top-button" onClick={scrollToTop}>
          ↑ 返回頂部
        </button>
      )}
    </div>
  );
};

export default SearchVenueListPage;
