import React, { useState, useEffect, useRef } from 'react';
import './FeedSection.css';

const FeedSection = ({ userEmail }) => {
  const [feedData, setFeedData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ws, setWs] = useState(null);
  const [reactionUpdates, setReactionUpdates] = useState({});

  useEffect(() => {
    fetchFeedData();
    initializeWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [userEmail]);

  const fetchFeedData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const url = userEmail 
        ? `https://invite-backend-vk36.onrender.com/invitations/feed/data?userEmail=${encodeURIComponent(userEmail)}`
        : 'https://invite-backend-vk36.onrender.com/invitations/feed/data';
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch feed data');
      }
      const result = await response.json();
      setFeedData(result.feedData);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeWebSocket = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    // Try both wss and ws protocols
    const protocols = ['wss://', 'ws://'];
    let currentProtocol = 0;

    const tryConnect = () => {
      if (currentProtocol >= protocols.length) {
        console.log('All WebSocket connection attempts failed');
        return;
      }

      const wsUrl = `${protocols[currentProtocol]}invite-backend-vk36.onrender.com?token=${token}`;
      console.log(`Attempting WebSocket connection: ${wsUrl}`);
      
      const websocket = new WebSocket(wsUrl);

      websocket.onopen = () => {
        console.log('WebSocket connected');
        setWs(websocket);
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'reaction_update') {
            setReactionUpdates(prev => ({
              ...prev,
              [data.invitationId]: {
                [data.reactionType]: data.count
              }
            }));
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      websocket.onclose = () => {
        console.log('WebSocket disconnected');
        setWs(null);
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        currentProtocol++;
        // Try next protocol after a short delay
        setTimeout(tryConnect, 1000);
      };
    };

    tryConnect();
  };

  const handleReaction = async (invitationId, reactionType) => {
    if (!userEmail) {
      alert('Please log in to react to posts');
      return;
    }

    try {
      const response = await fetch(`https://invite-backend-vk36.onrender.com/invitations/${invitationId}/reaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reactionType,
          userEmail
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update reaction');
      }

      const result = await response.json();
      
      // Update local state immediately for better UX
      setFeedData(prevData => 
        prevData.map(invitation => 
          invitation._id === invitationId 
            ? { ...invitation, reactions: result.invitation.reactions }
            : invitation
        )
      );
    } catch (error) {
      console.error('Error updating reaction:', error);
      alert('Failed to update reaction. Please try again.');
    }
  };

  const getReactionCount = (invitation, reactionType) => {
    if (reactionUpdates[invitation._id] && reactionUpdates[invitation._id][reactionType] !== undefined) {
      return reactionUpdates[invitation._id][reactionType];
    }
    return invitation.reactions?.[reactionType]?.count || 0;
  };

  const isUserReacted = (invitation, reactionType) => {
    if (!userEmail) return false;
    return invitation.reactions?.[reactionType]?.users?.includes(userEmail) || false;
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - postDate) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (isLoading) {
    return (
      <div className="feed-section">
        <h2 className="section-header">Feed</h2>
        <div className="loading">Loading feed...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="feed-section">
        <h2 className="section-header">Feed</h2>
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="feed-section">
      <h2 className="section-header">Feed</h2>
      <div className="feed-container">
        {feedData.length === 0 ? (
          <p className="no-posts">No posts available yet.</p>
        ) : (
          feedData.map((post) => (
            <div key={post._id} className="feed-post">
              {/* Post Header */}
              <div className="post-header">
                <div className="user-info">
                  <div className="user-avatar">
                    {post.createdByEmail ? post.createdByEmail.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="user-details">
                    <span className="username">{post.eventName || 'Event'}</span>
                    <span className="user-email">{post.createdByEmail || 'Unknown User'}</span>
                    <span className="post-time">{formatTimeAgo(post.createdAt)}</span>
                  </div>
                </div>
                <div className="post-options">
                  <span className="material-symbols-outlined">more_horiz</span>
                </div>
              </div>

              {/* Post Content */}
              <div className="post-content">
                {/* Event Media Gallery - Show eventMedia images first */}
                {post.eventMedia && post.eventMedia.length > 0 ? (
                  <div className="post-gallery">
                    {post.eventMedia.map((media, index) => (
                      <img 
                        key={media._id || index}
                        src={media.url} 
                        alt={`Event media ${index + 1}`} 
                        className="gallery-image"
                      />
                    ))}
                  </div>
                ) : post.invitationImage ? (
                  /* Fallback to invitation image if no eventMedia */
                  <div className="post-image-container">
                    <img 
                      src={post.invitationImage.url} 
                      alt={post.eventName || 'Event'} 
                      className="post-image"
                    />
                  </div>
                ) : null}
              </div>

              {/* Reaction Buttons */}
              <div className="reaction-buttons">
                <button 
                  className={`reaction-btn ${isUserReacted(post, 'cheer') ? 'active' : ''}`}
                  onClick={() => handleReaction(post._id, 'cheer')}
                >
                  <span className="reaction-emoji">🎉</span>
                  <span className="reaction-label">Cheer</span>
                  <span className="reaction-count">{getReactionCount(post, 'cheer')}</span>
                </button>

                <button 
                  className={`reaction-btn ${isUserReacted(post, 'groove') ? 'active' : ''}`}
                  onClick={() => handleReaction(post._id, 'groove')}
                >
                  <span className="reaction-emoji">🪩</span>
                  <span className="reaction-label">Groove</span>
                  <span className="reaction-count">{getReactionCount(post, 'groove')}</span>
                </button>

                <button 
                  className={`reaction-btn ${isUserReacted(post, 'chill') ? 'active' : ''}`}
                  onClick={() => handleReaction(post._id, 'chill')}
                >
                  <span className="reaction-emoji">🍹</span>
                  <span className="reaction-label">Chill</span>
                  <span className="reaction-count">{getReactionCount(post, 'chill')}</span>
                </button>

                <button 
                  className={`reaction-btn ${isUserReacted(post, 'hype') ? 'active' : ''}`}
                  onClick={() => handleReaction(post._id, 'hype')}
                >
                  <span className="reaction-emoji">🔥</span>
                  <span className="reaction-label">Hype</span>
                  <span className="reaction-count">{getReactionCount(post, 'hype')}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FeedSection;
