import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './MyInvitations.css';

function MyInvitations() {
  const navigate = useNavigate();
  const [userInvitations, setUserInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState({});
  const [analyticsData, setAnalyticsData] = useState({});

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

  const toggleAnalytics = (invitationId) => {
    setShowAnalytics(prev => ({
      ...prev,
      [invitationId]: !prev[invitationId]
    }));
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

  const getReactionUsers = (invitation, reactionType) => {
    return invitation.reactions?.[reactionType]?.users || [];
  };

  const formatUserEmail = (email) => {
    if (!email) return 'Unknown User';
    const [username, domain] = email.split('@');
    return `${username}@${domain}`;
  };

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
                  
                  {/* Analytics Section */}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAnalytics(invitation._id);
                      }}
                    >
                      <span className="material-symbols-outlined">
                        {showAnalytics[invitation._id] ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
                      </span>
                      {showAnalytics[invitation._id] ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>

                  {/* Detailed Analytics */}
                  {showAnalytics[invitation._id] && (
                    <div className="analytics-details">
                      <div className="reaction-breakdown">
                        <h4>Reaction Breakdown</h4>
                        {['cheer', 'groove', 'chill', 'hype'].map(reactionType => {
                          const users = getReactionUsers(invitation, reactionType);
                          const count = invitation.reactions?.[reactionType]?.count || 0;
                          return (
                            <div key={reactionType} className="reaction-item">
                              <div className="reaction-header">
                                <span className="reaction-emoji">{getReactionEmoji(reactionType)}</span>
                                <span className="reaction-name">{reactionType.charAt(0).toUpperCase() + reactionType.slice(1)}</span>
                                <span className="reaction-count">({count})</span>
                              </div>
                              {users.length > 0 && (
                                <div className="reaction-users">
                                  {users.map((email, index) => (
                                    <div key={index} className="reaction-user">
                                      <div className="user-avatar-small">
                                        {email.charAt(0).toUpperCase()}
                                      </div>
                                      <span className="user-email-small">{formatUserEmail(email)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="response-analysis">
                        <h4>Response Analysis</h4>
                        <div className="response-stats">
                          <div className="response-item">
                            <span className="response-label">Total Invited:</span>
                            <span className="response-value">{stats.totalInvited}</span>
                          </div>
                          <div className="response-item">
                            <span className="response-label">People Reacted:</span>
                            <span className="response-value">{stats.uniqueUsers}</span>
                          </div>
                          <div className="response-item">
                            <span className="response-label">Response Rate:</span>
                            <span className="response-value">{stats.responseRate}%</span>
                          </div>
                        </div>
                        
                        {stats.totalInvited > 0 && (
                          <div className="response-bar">
                            <div 
                              className="response-fill" 
                              style={{ width: `${stats.responseRate}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
