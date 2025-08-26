import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Invited.css';

function Invited() {
  const navigate = useNavigate();
  const location = useLocation();
  const [acceptedInvitations, setAcceptedInvitations] = useState([]);

  useEffect(() => {
    // Load existing accepted invitations from local storage on component mount
    const storedInvitations = JSON.parse(localStorage.getItem('acceptedInvitations')) || [];
    setAcceptedInvitations(storedInvitations);

    // Check if there's a new accepted invitation from navigation state
    if (location.state?.acceptedInvitation) {
      const newInvitation = location.state.acceptedInvitation;
      const isAlreadyAdded = storedInvitations.some(inv => inv._id === newInvitation._id);

      if (!isAlreadyAdded) {
        const updatedInvitations = [...storedInvitations, newInvitation];
        localStorage.setItem('acceptedInvitations', JSON.stringify(updatedInvitations));
        setAcceptedInvitations(updatedInvitations);
      }
      // Clear the state so it doesn't re-add on subsequent visits
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleCardClick = (invitationId) => {
    navigate(`/event-gallery/${invitationId}`);
  };

  return (
    <div className="invited-container">
      <h1>Invited Events</h1>
      <div className="card-container">
        {acceptedInvitations.length > 0 ? (
          acceptedInvitations.map((invitation) => (
            <div
              className="card"
              key={invitation._id}
              onClick={() => handleCardClick(invitation._id)}
              style={{ cursor: 'pointer' }}
            >
              {invitation.invitationImage && (
                <img src={invitation.invitationImage.url} alt="Invitation Card" className="invitation-image" />
              )}
              <div className="event-details">
                {/* Removed eventDate as dateTime is now used for event date and time */}
                {invitation.eventName && <p className="event-name">{invitation.eventName}</p>}
                {invitation.location && <p className="event-location">📍 {invitation.location}</p>}
                {invitation.description && <p className="event-description">{invitation.description}</p>}
                {invitation.dateTime && <p className="event-date-time">🗓️ {new Date(invitation.dateTime).toLocaleString()}</p>}
                <p className="event-host">Hosted by: {invitation.invitedBy}</p>
                <p className="event-privacy">{invitation.eventPrivacy === 'private' ? '🔒 Private' : '🌍 Public'}</p>

              </div>
            </div>
          ))
        ) : (
          <p>No accepted invitations yet.</p>
        )}
      </div>
    </div>
  );
}

export default Invited;
