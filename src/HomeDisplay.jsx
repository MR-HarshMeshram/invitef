import React from 'react';
import { useNavigate } from 'react-router-dom';
import './InvitationDisplay.css'; // Reuse the existing CSS for styling

function HomeDisplay({ invitation, loggedInUserEmail, handleGalleryClick, handleUploadClick, handleShareClick, handleDeleteClick, handleAcceptClick, handleDeclineClick, hasAccepted, handleEditClick }) {
  const navigate = useNavigate();

  if (!invitation) {
    return (
      <div className="invitation-display-container">
        <h2>No invitation data found.</h2>
        <button onClick={() => navigate('/invitation')}>Create New Invitation</button>
      </div>
    );
  }

  return (
    <div className="invitation-card" onClick={(invitation.eventPrivacy === 'public' || hasAccepted) ? handleGalleryClick : undefined} style={{ cursor: (invitation.eventPrivacy === 'public' || hasAccepted) ? 'pointer' : 'default' }}>
      {invitation.invitationImage && (
        <img src={invitation.invitationImage.url} alt="Invitation Card" className="invitation-image" />
      )}
      <div className="invitation-content">
        {/* Removed eventDate as dateTime is now used for event date and time */}
        {invitation.dateTime && <p className="event-date">🗓️ {new Date(invitation.dateTime).toLocaleString()}</p>}
        <h3>{invitation.eventName}</h3>
        <p className="location-display">📍 {invitation.location}</p>
        {invitation.description && <p className="description-display">{invitation.description}</p>}
        <p className="host-display">Hosted by: {invitation.invitedBy}</p>
        <p className="privacy-display">
          {invitation.eventPrivacy === 'private' ? (
            <><img src="https://img.icons8.com/ios-filled/24/000000/lock.png" alt="Lock icon" className="lock-icon" /> Private</>
          ) : (
            <><img src="https://img.icons8.com/ios-filled/24/000000/globe--v1.png" alt="Public icon" className="globe-icon" /> Public</>
          )}
        </p>
        <div className="card-actions">
          {loggedInUserEmail === invitation.createdByEmail && (
            <div className="action-icon-box" onClick={handleUploadClick}>
              <img src="https://img.icons8.com/ios/24/000000/upload.png" alt="Upload" className="action-icon" />
              <p className="action-text">Upload</p>
            </div>
          )}
          {loggedInUserEmail === invitation.createdByEmail && (
            <div className="action-icon-box" onClick={handleEditClick}>
              <img src="https://img.icons8.com/ios/24/000000/edit.png" alt="Edit" className="action-icon" />
              <p className="action-text">Edit</p>
            </div>
          )}
          {loggedInUserEmail === invitation.createdByEmail && (
            <div className="action-icon-box" onClick={handleShareClick}>
              <img src="https://img.icons8.com/ios/24/000000/share.png" alt="Share" className="action-icon" />
              <p className="action-text">Share</p>
            </div>
          )}
          {loggedInUserEmail === invitation.createdByEmail && (
            <div className="action-icon-box" onClick={handleDeleteClick}>
              <img src="https://img.icons8.com/ios/24/000000/trash.png" alt="Delete" className="action-icon" />
              <p className="action-text">Delete</p>
            </div>
          )}
          {loggedInUserEmail !== invitation.createdByEmail && invitation.eventPrivacy === 'private' && (
            <div className="action-icon-box" onClick={handleAcceptClick}>
              <img src="https://img.icons8.com/ios/24/000000/checked--v1.png" alt="Accept" className="action-icon" />
              <p className="action-text">Accept</p>
            </div>
          )}
          {loggedInUserEmail !== invitation.createdByEmail && invitation.eventPrivacy === 'private' && (
            <div className="action-icon-box" onClick={handleDeclineClick}>
              <img src="https://img.icons8.com/ios/24/000000/multiply.png" alt="Decline" className="action-icon" />
              <p className="action-text">Decline</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomeDisplay;
