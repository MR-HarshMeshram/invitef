import React from 'react';
import { useNavigate } from 'react-router-dom';
import './InvitationDisplay.css'; // Reuse the existing CSS for styling

function HomeDisplay({ invitation, loggedInUserEmail, handleGalleryClick, handleUploadClick, handleShareClick, handleDeleteClick, handleAcceptClick, handleDeclineClick, hasAccepted }) {
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
            <img src="https://img.icons8.com/ios/24/000000/upload.png" alt="Upload" className="action-icon upload-icon" onClick={handleUploadClick} />
          )}
          {loggedInUserEmail === invitation.createdByEmail && (
            <img src="https://img.icons8.com/ios/24/000000/share.png" alt="Share" className="action-icon share-icon" onClick={handleShareClick} />
          )}
          {loggedInUserEmail === invitation.createdByEmail && (
            <img src="https://img.icons8.com/ios/24/000000/trash.png" alt="Delete" className="action-icon delete-icon" onClick={handleDeleteClick} />
          )}
          {loggedInUserEmail !== invitation.createdByEmail && invitation.eventPrivacy === 'private' && (
            <img src="https://img.icons8.com/ios/24/000000/checked--v1.png" alt="Accept" className="action-icon accept-icon" onClick={handleAcceptClick} />
          )}
          {loggedInUserEmail !== invitation.createdByEmail && invitation.eventPrivacy === 'private' && (
            <img src="https://img.icons8.com/ios/24/000000/multiply.png" alt="Decline" className="action-icon decline-icon" onClick={handleDeclineClick} />
          )}
        </div>
      </div>
    </div>
  );
}

export default HomeDisplay;
