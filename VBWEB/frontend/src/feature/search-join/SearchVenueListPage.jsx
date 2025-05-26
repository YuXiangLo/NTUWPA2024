import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { API_DOMAIN } from "../../config.js";
import CustomSelect from "../../components/CustomSelect"; // Adjust path as needed

const SearchVenueListPage = () => {
  // Search/filter states
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
          throw new Error("Network response was not ok");
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

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top of the page
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    const statusMatch = statusFilter === "all" || venue.status === statusFilter;
    return keywordMatch && statusMatch;
  });

  // Basic loading and error messages
  if (loading) {
    return (
      <h1
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          margin: 0,
        }}
      >
        Loading...
      </h1>
    );
  }

  if (error) {
    return (
      <h1
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
          margin: 0,
        }}
      >
        Error: {error}
      </h1>
    );
  }

  return (
    <div className="app-card-page">
      <h1 className="h1">搜尋場館</h1>

      <div className="app-search-section">
        <input
          type="text"
          className="app-search-input"
          placeholder="搜尋場館名稱或地址..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <CustomSelect
          value={statusFilter}
          onChange={(val) => setStatusFilter(val)}
          options={[
            { label: "全部狀態", value: "all" },
            { label: "開放", value: "open" },
            { label: "關閉", value: "closed" },
            { label: "test", value: "test" },
          ]}
        />
      </div>

      {/* Header row for venues */}
      <div className="app-venue-header-row">
        <span className="app-venue-col app-venue-col-name">場館名稱</span>
        <span className="app-venue-col app-venue-col-address">地址</span>
        <span className="app-venue-col app-venue-col-count">場地數</span>
        <span className="app-venue-col app-venue-col-status">狀態</span>
        <span className="app-venue-col app-venue-col-actions">詳細資料</span>
      </div>

      <div className="app-venue-list">
        {filteredVenues.length > 0 ? (
          filteredVenues.map((venue) => (
            <div key={venue.id} className="app-venue-card">
              <div className="app-venue-row">
                <span className="app-venue-col app-venue-col-name">{venue.name}</span>
                <span className="app-venue-col app-venue-col-address">{venue.address}</span>
                <span className="app-venue-col app-venue-col-count">
                  {venue.courts ? venue.courts.length : 0}
                </span>
                <span className="app-venue-col app-venue-col-status">{venue.status}</span>
                <span className="app-venue-col app-venue-col-actions">
                  <Link
                    to={`/venue/${venue.id}`}
                    className="app-btn app-venue-detail-button"
                  >
                    詳情
                  </Link>
                  <button
                    className="app-venue-toggle-button"
                    onClick={() => toggleVenue(venue.id)}
                  >
                    {toggledVenues[venue.id] ? "隱藏場地" : "顯示場地"}
                  </button>
                </span>
              </div>
              {toggledVenues[venue.id] && (
                <div className="app-court-list">
                  {venue.courts && venue.courts.length > 0 ? (
                    venue.courts.map((court) => (
                      <div key={court.id} className="app-court-card">
                        <div className="app-court-info">
                          <span className="app-court-name">{court.name}</span>
                          <span className="app-court-material">
                            材質：{court.property}
                          </span>
                        </div>
                        <div>
                          <Link
                            to={`/venues/${venue.id}/courts/${court.id}/schedule`}
                            className="app-btn"
                          >
                            詳情
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="app-no-courts">暫無場地資訊</p>
                  )}
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="app-no-venues">查無資料</p>
        )}
      </div>

      {/* "Scroll to Top" Button */}
      {showToTop && (
        <button className="app-to-top-button" onClick={scrollToTop}>
          ↑ 返回頂部
        </button>
      )}
    </div>
  );
};

export default SearchVenueListPage;
