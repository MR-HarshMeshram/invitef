import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Invited.css';

function Invited() {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate('/event-gallery');
  };

  return (
    <div className="invited-container">
      <h1>Invited Events</h1>
      <div className="card-container">
        <div className="card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
          <span style={{ fontSize: '60px' }}>🎵</span>
          <div className="event-details">
            <p className="event-date">Sun, 05 Oct, 7 PM</p>
            <p className="event-name">Eric Prydz India 2025 | Mumbai</p>
            <p className="event-price">₹2500 onwards</p>
          </div>
        </div>

        <div className="card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
          <span style={{ fontSize: '60px' }}>🎵</span>
          <div className="event-details">
            <p className="event-date">Sun, 05 Oct, 7 PM</p>
            <p className="event-name">Music Festival 2025 | Delhi</p>
            <p className="event-price">₹3000 onwards</p>
          </div>
        </div>

        <div className="card" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
          <span style={{ fontSize: '60px' }}>🎵</span>
          <div className="event-details">
            <p className="event-date">Sat, 15 Nov, 8 PM</p>
            <p className="event-name">Jazz Night Live | Bangalore</p>
            <p className="event-price">₹1500 onwards</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Invited;
