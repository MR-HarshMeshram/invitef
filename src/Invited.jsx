import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Invited.css';

function Invited() {
  const navigate = useNavigate();
  const [acceptedInvitations, setAcceptedInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAcceptedInvitations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const userEmail = localStorage.getItem('userEmail');
        const accessToken = localStorage.getItem('accessToken');

        if (!userEmail || !accessToken) {
          // If not logged in, clear invitations and stop loading
          setAcceptedInvitations([]);
          setIsLoading(false);
          return;
        }

        // Assuming a new endpoint to fetch invitations accepted by a user
        const response = await fetch(`https://invite-backend-vk36.onrender.com/invitations/accepted-by-user/${userEmail}`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch accepted invitations.');
        }

        const data = await response.json();
        setAcceptedInvitations(data.invitations || []);
      } catch (err) {
        console.error('Error fetching accepted invitations:', err);
        setError(err.message);
        setAcceptedInvitations([]); // Ensure it's empty on error
      } finally {
        setIsLoading(false);
      }
    };

    fetchAcceptedInvitations();
  }, []); // Empty dependency array means this runs once on mount

  const handleCardClick = (invitationId) => {
    navigate(`/invitation/${invitationId}`); // Navigate to InvitationGalleryPage
  };

  return (
    <div className="invited-container">
      <h1>Invited Events</h1>
      {isLoading && <p>Loading accepted invitations...</p>}
      {error && <p className="error-message">{error}</p>}
      {!isLoading && !error && acceptedInvitations.length === 0 && (
        <p>The invite is not accepted on your account.</p>
      )}
      <div className="card-container">
        {acceptedInvitations.length > 0 && (
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
                <p className="invitation-card-title">{invitation.eventName}</p>
                <p className="invitation-card-from">From: {invitation.invitedBy}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Invited;
