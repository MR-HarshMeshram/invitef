import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyInvitations.css';

function MyInvitations() {
  const navigate = useNavigate();
  const [userInvitations, setUserInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserInvitations = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const userEmail = localStorage.getItem('userEmail');
    const accessToken = localStorage.getItem('accessToken');

    if (!userEmail || !accessToken) {
      setError('User not logged in or token missing. Please log in again.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://invite-backend-vk36.onrender.com/invitations/user/${userEmail}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch invitations.');
      }

      const result = await response.json();
      setUserInvitations(result.invitations);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserInvitations();
  }, [fetchUserInvitations]);

  const handleInvitationCardClick = (invitation) => {
    navigate(`/invitation/${invitation._id}`); // Navigate to the combined invitation gallery page
  };

  return (
    <div className="my-invitations-container">
      {/* <h1> My invitations</h1>  <h1> My invitations</h1>   */}
      {/* <header className="my-invitations-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="header-title">My Invitations</h1>
      </header> */}

      <main className="my-invitations-content">
      <h1> My invitations</h1> 
        {isLoading ? (
          <p>Loading your invitations...</p>
        ) : error ? (
          <p className="error-message">Error: {error}</p>
        ) : userInvitations.length > 0 ? (
          <div className="invitation-grid">
            {userInvitations.map((invitation) => (
              <div className="invitation-card" key={invitation._id} onClick={() => handleInvitationCardClick(invitation)}>
                {invitation.invitationImage && (
                  <img src={invitation.invitationImage.url} alt={invitation.eventName} className="invitation-card-image" />
                )}
                <div className="invitation-card-details">
                  <h2 className="invitation-card-title">{invitation.eventName || 'Event Name'}</h2>
                  <p className="invitation-card-from">From {invitation.invitedBy || 'Host'}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>You haven't created any invitations yet.</p>
        )}
      </main>
    </div>
  );
}

export default MyInvitations;
