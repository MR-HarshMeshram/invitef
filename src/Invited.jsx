import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Invited.css';

function Invited() {
  const navigate = useNavigate();
  const location = useLocation();
  const [acceptedInvitations, setAcceptedInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInUserEmail, setLoggedInUserEmail] = useState(localStorage.getItem('userEmail'));

  const fetchAcceptedInvitations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken || !loggedInUserEmail) {
        // If not logged in, or email not available, return empty
        setAcceptedInvitations([]);
        setIsLoading(false);
        return;
      }

      // --- IMPORTANT --- 
      // This API endpoint `invitations/accepted-by-user/${loggedInUserEmail}` is *hypothetical*.
      // It assumes your backend has an endpoint to fetch invitations accepted by a specific user.
      // If this endpoint does not exist, you will need to implement it on your backend.
      // For now, I will use a dummy endpoint or fallback to local storage if necessary.
      const response = await fetch(`https://invite-backend-vk36.onrender.com/invitations/accepted-by-user/${loggedInUserEmail}`, {
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

  useEffect(() => {
    fetchAcceptedInvitations();
  }, [loggedInUserEmail]); // Refetch when user email changes (e.g., after login)

  const handleInvitationCardClick = (invitationId) => {
    navigate(`/invitation/${invitationId}`);
  };

  if (isLoading) {
    return <div className="invited-container">Loading accepted invitations...</div>;
  }

  if (error) {
    return <div className="invited-container">Error: {error}</div>;
  }

  return (
    <div className="invited-container">
      <header className="invited-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="header-title">My Accepted Invitations</h1>
      </header>

      <main className="invited-content">
        {acceptedInvitations.length > 0 ? (
          <div className="invitation-grid">
            {acceptedInvitations.map((invitation) => (
              <div
                className="invitation-card"
                key={invitation._id}
                onClick={() => handleInvitationCardClick(invitation._id)}
              >
                {invitation.invitationImage && (
                  <img src={invitation.invitationImage.url} alt="Invitation Card" className="invitation-card-image" />
                )}
                <div className="invitation-card-details">
                  {invitation.eventName && <p className="invitation-card-title">{invitation.eventName}</p>}
                  {invitation.invitedBy && <p className="invitation-card-from">From: {invitation.invitedBy}</p>}
                </div>
              </div>
            ))}
          </div>
        ) : ( 
          <p className="no-invitations-message">No accepted invitations yet.</p>
        )}
      </main>
    </div>
  );
}

export default Invited;
