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

  useEffect(() => {
    const validateAndSetInvitations = async () => {
      const storedInvitations = JSON.parse(localStorage.getItem('acceptedInvitations')) || [];
      const validInvitations = [];

      for (const inv of storedInvitations) {
        try {
          const response = await fetch(`https://invite-backend-vk36.onrender.com/invitations/${inv._id}`);
          if (response.ok) {
            validInvitations.push(inv); // Invitation still exists, keep it
          } else if (response.status === 404) {
            console.log(`Invitation with ID ${inv._id} no longer exists and will be removed.`);
          } else {
            // Handle other potential errors, maybe keep for now or log
            console.error(`Error validating invitation ${inv._id}: ${response.status}`);
            validInvitations.push(inv); // Keep if other error, can be re-evaluated
          }
        } catch (error) {
          console.error(`Network error validating invitation ${inv._id}:`, error);
          validInvitations.push(inv); // Keep on network error to retry later
        }
      }

      setAcceptedInvitations(validInvitations);
      localStorage.setItem('acceptedInvitations', JSON.stringify(validInvitations));
    };

    validateAndSetInvitations();
  }, []); // Run once on mount

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
