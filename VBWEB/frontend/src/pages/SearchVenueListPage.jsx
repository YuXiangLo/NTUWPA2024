import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './SearchVenueListPage.css';

const SearchVenueListPage = () => {
  // State for search filters
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Sample data simulating backend response
  const sampleVenues = [
    {
      venue_id: '1',
      name: 'Downtown Sports Center',
      address: '123 Main St, City, Country',
      status: 'open',
      courts: [
        {
          court_id: '101',
          name: 'Court 1',
          material: 'Hardwood'
        },
        {
          court_id: '102',
          name: 'Court 2',
          material: 'Clay'
        }
      ]
    },
    {
      venue_id: '2',
      name: 'Eastside Recreation Center',
      address: '456 Elm St, City, Country',
      status: 'closed',
      courts: [
        {
          court_id: '201',
          name: 'Court A',
          material: 'Synthetic'
        }
      ]
    },
    {
      venue_id: '3',
      name: 'West End Arena',
      address: '789 Oak Rd, City, Country',
      status: 'open',
      courts: [] // Example with no courts
    }
  ];

  const [venues, setVenues] = useState([]);
  // Track toggle state for each venue's court list
  const [toggledVenues, setToggledVenues] = useState({});

  useEffect(() => {
    // In real-world scenario, fetch venues from your API.
    setVenues(sampleVenues);
  }, []);

  // Toggle the display for each venue's court list
  const toggleVenue = (venueId) => {
    setToggledVenues((prev) => ({
      ...prev,
      [venueId]: !prev[venueId]
    }));
  };

  // Filter venues based on search text and status filter
  const filteredVenues = venues.filter((venue) => {
    const keywordMatch =
      venue.name.toLowerCase().includes(searchText.toLowerCase()) ||
      venue.address.toLowerCase().includes(searchText.toLowerCase());
    const statusMatch = statusFilter === 'all' || venue.status === statusFilter;
    return keywordMatch && statusMatch;
  });

  return (
    <div className="svl-container">
      <h1 className="svl-title">搜尋場地</h1>

      <div className="svl-search-section">
        <input
          type="text"
          className="svl-search-input"
          placeholder="搜尋場地名稱或地址..."
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
        </select>
      </div>

      {/* Header row for the venue table */}
      <div className="svl-header-row">
        <span className="svl-col svl-col-name">場地名稱</span>
        <span className="svl-col svl-col-address">地址</span>
        <span className="svl-col svl-col-count">場地數</span>
        <span className="svl-col svl-col-status">狀態</span>
        <span className="svl-col svl-col-actions">詳細內容</span>
      </div>

      <div className="svl-venue-list">
        {filteredVenues.length > 0 ? (
          filteredVenues.map((venue) => (
            <div key={venue.venue_id} className="svl-venue-card">
              <div className="svl-venue-row">
                <span className="svl-col svl-col-name">{venue.name}</span>
                <span className="svl-col svl-col-address">{venue.address}</span>
                <span className="svl-col svl-col-count">
                  {venue.courts ? venue.courts.length : 0}
                </span>
                <span className="svl-col svl-col-status">{venue.status}</span>
                <span className="svl-col svl-col-actions">
                  <Link to={`/venue/${venue.venue_id}`} className="svl-detail-button">
                    詳情
                  </Link>
                  <button
                    className="svl-toggle-button"
                    onClick={() => toggleVenue(venue.venue_id)}
                  >
                    {toggledVenues[venue.venue_id] ? '隱藏場地' : '顯示場地'}
                  </button>
                </span>
              </div>
              {toggledVenues[venue.venue_id] && (
                <div className="svl-court-list">
                  {venue.courts && venue.courts.length > 0 ? (
                    venue.courts.map((court) => (
                      <div key={court.court_id} className="svl-court-card">
                        <div className="svl-court-info">
                          <span className="svl-court-name">{court.name}</span>
                          <span className="svl-court-material">材質：{court.material}</span>
                        </div>
                        <div className="svl-court-action">
                          <Link to={`/schedule/${court.court_id}`} className="svl-schedule-button">
                            排程
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
    </div>
  );
};

export default SearchVenueListPage;
