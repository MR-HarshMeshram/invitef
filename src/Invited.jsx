import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Invited.css';

function Invited() {
  const navigate = useNavigate();
  const location = useLocation();
  const [userCreatedInvitations, setUserCreatedInvitations] = useState([]); // Renamed state
  const [loading, setLoading] = useState(true); // Added loading state
  const [error, setError] = useState(null); // Added error state

  useEffect(() => {
    const fetchUserCreatedInvitations = async () => {
      setLoading(true);
      setError(null);
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          setError('Authentication token missing. Please log in.');
          setLoading(false);
          return;
        }

        const response = await fetch(`https://invite-backend-vk36.onrender.com/invitations/user`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch user invitations.');
        }

        const result = await response.json();
        setUserCreatedInvitations(result.invitations);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserCreatedInvitations();
  }, []);

  const handleCardClick = (invitationId) => {
    navigate(`/invitation/${invitationId}`); // Navigate to InvitationGalleryPage
  };

  return (
    <div className="invited-page-container">
      <header className="invited-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="header-title">My Invitations</h1>
      </header>

      <main className="invited-content">
        {loading ? (
          <p className="loading-message">Loading invitations...</p>
        ) : error ? (
          <p className="error-message">Error: {error}</p>
        ) : userCreatedInvitations.length > 0 ? (
          <div className="invitation-grid">
            {userCreatedInvitations.map((invitation) => (
              <div className="invitation-card" key={invitation._id} onClick={() => handleCardClick(invitation._id)}>
                {invitation.invitationImage && (
                  <img src={invitation.invitationImage.url} alt={invitation.eventName} className="invitation-card-image" />
                )}
                <div className="invitation-card-details">
                  <h2 className="invitation-card-title">{invitation.eventName}</h2>
                  <p className="invitation-card-host">From {invitation.invitedBy || 'Unknown'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="no-invitations-message">You haven't created any invitations yet.</p>
        )}
      </main>
    </div>
  );
}

export default Invited;
