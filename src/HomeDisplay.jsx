import React from 'react';
import { useNavigate } from 'react-router-dom';
import './InvitationDisplay.css'; // Reuse the existing CSS for styling

function HomeDisplay({ invitation, loggedInUserEmail, isAccepted, handleGalleryClick, handleUploadClick, handleShareClick, handleDeleteClick, handleAcceptClick, handleDeclineClick }) {
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
    <div className="invitation-card">
      {invitation.invitationImage && (
        <img src={invitation.invitationImage.url} alt="Invitation Card" className="invitation-image" />
      )}
      <div className="invitation-content">
        <p className="event-date">
          {invitation.eventDate
            ? new Date(invitation.eventDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })
            : 'Date Not Available'}
        </p>
        <h3>{invitation.eventName}</h3>
        <p className="location-display">📍 {invitation.location}</p>
        <p className="host-display">Hosted by: {invitation.invitedBy}</p>
        <p className="privacy-display">
          {invitation.eventPrivacy === 'private' ? (
            <><img src="https://img.icons8.com/ios-filled/24/000000/lock.png" alt="Lock icon" className="lock-icon" /> Private</>
          ) : (
            <><img src="https://img.icons8.com/ios-filled/24/000000/globe--v1.png" alt="Public icon" className="globe-icon" /> Public</>
          )}
        </p>
        <div className="card-actions">
          {isAccepted && (
            <button className="action-button gallery-button" onClick={handleGalleryClick}>Gallery</button>
          )}
          {loggedInUserEmail === invitation.createdByEmail && (
            <button className="action-button upload-button" onClick={handleUploadClick}>Upload</button>
          )}
          {loggedInUserEmail === invitation.createdByEmail && (
            <button className="action-button share-button" onClick={handleShareClick}>Share</button>
          )}
          {loggedInUserEmail === invitation.createdByEmail && (
            <button className="action-button delete-button" onClick={handleDeleteClick}>Delete</button>
          )}
          {loggedInUserEmail !== invitation.createdByEmail && invitation.eventPrivacy === 'private' && (
            <button className="action-button accept-button" onClick={handleAcceptClick}>Accept</button>
          )}
          {loggedInUserEmail !== invitation.createdByEmail && invitation.eventPrivacy === 'private' && (
            <button className="action-button decline-button" onClick={handleDeclineClick}>Decline</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomeDisplay;
