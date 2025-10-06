import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyInvitations.css';

function MyInvitations() {
  const navigate = useNavigate();
  const [userInvitations, setUserInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState({});

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

  const goToAnalytics = (invitationId) => {
    navigate(`/invitation/${invitationId}#analytics`);
  };

  const getReactionStats = (invitation) => {
    const reactions = invitation.reactions || {};
    const totalReactions = Object.values(reactions).reduce((sum, reaction) => sum + (reaction.count || 0), 0);
    const totalUsers = new Set();
    
    Object.values(reactions).forEach(reaction => {
      if (reaction.users) {
        reaction.users.forEach(user => totalUsers.add(user));
      }
    });

    const uniqueUsers = totalUsers.size;
    const totalInvited = invitation.acceptedUsers ? invitation.acceptedUsers.length : 0;
    const responseRate = totalInvited > 0 ? (uniqueUsers / totalInvited) * 100 : 0;

    return {
      totalReactions,
      uniqueUsers,
      totalInvited,
      responseRate: Math.round(responseRate),
      reactions: reactions
    };
  };

  // We intentionally do not expose individual user emails in analytics for privacy.

  const getReactionEmoji = (reactionType) => {
    const emojis = {
      cheer: '🎉',
      groove: '🪩',
      chill: '🍹',
      hype: '🔥'
    };
    return emojis[reactionType] || '👍';
  };

  return (
    <div className="my-invitations-container">
      
      <header className="my-invitations-header">
        
      </header>
      

      <main className="my-invitations-content">
      <h1> My invitations</h1> 
        {isLoading ? (
          <p>Loading your invitations...</p>
        ) : error ? (
          <p className="error-message">Error: {error}</p>
        ) : userInvitations.length > 0 ? (
          <div className="invitation-grid">
            {userInvitations.map((invitation) => {
              const stats = getReactionStats(invitation);
              return (
                <div className="invitation-card" key={invitation._id}>
                  <div className="invitation-card-content" onClick={() => handleInvitationCardClick(invitation)}>
                    {invitation.invitationImage && (
                      <img src={invitation.invitationImage.url} alt={invitation.eventName} className="invitation-card-image" />
                    )}
                    <div className="invitation-card-details">
                      <h2 className="invitation-card-title">{invitation.eventName || 'Event Name'}</h2>
                      <p className="invitation-card-from">From {invitation.invitedBy || 'Host'}</p>
                    </div>
                  </div>
                  
                  {/* Compact Analytics Section */}
                  <div className="analytics-section">
                    <div className="analytics-summary">
                      <div className="stat-item">
                        <span className="stat-number">{stats.totalReactions}</span>
                        <span className="stat-label">Total Reactions</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">{stats.uniqueUsers}</span>
                        <span className="stat-label">People Reacted</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-number">{stats.responseRate}%</span>
                        <span className="stat-label">Response Rate</span>
                      </div>
                    </div>
                    
                    <button 
                      className="analytics-toggle-btn"
                      onClick={(e) => { e.stopPropagation(); goToAnalytics(invitation._id); }}
                    >
                      <span className="material-symbols-outlined">insights</span>
                      View Analytics
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <p>You haven't created any invitations yet.</p>
        )}
      </main>
    </div>
  );
}

export default MyInvitations;
