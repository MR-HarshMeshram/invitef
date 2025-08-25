import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './InvitationDisplay.css'; // You'll need to create this CSS file

function InvitationDisplay() {
  const location = useLocation();
  const navigate = useNavigate();
  const { invitationId: urlInvitationId } = useParams(); // Get invitation ID from URL
  const [invitation, setInvitation] = useState(location.state?.invitation); // Initialize with state or null
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state
  const loggedInUserEmail = localStorage.getItem('userEmail'); // Get logged in user's email

  useEffect(() => {
    console.log("useEffect triggered. Invitation in state:", invitation, "URL ID:", urlInvitationId);
    // If no invitation in state and we have an ID from the URL, try to fetch it
    if (!invitation && urlInvitationId) {
      const fetchInvitation = async () => {
        setLoading(true); // Start loading
        setError(null); // Clear previous errors
        try {
          const accessToken = localStorage.getItem('accessToken');
          if (!accessToken) {
            console.log("Access token missing. Redirecting to login.");
            navigate('/login');
            return;
          }

          console.log(`Fetching invitation with ID: ${urlInvitationId}`);
          const response = await fetch(`https://invite-backend-vk36.onrender.com/invitations/${urlInvitationId}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to fetch invitation.');
          }

          const data = await response.json();
          console.log("Invitation fetched successfully:", data);
          setInvitation(data);
        } catch (error) {
          console.error('Error fetching invitation:', error);
          setError(error.message); // Set error state
          alert(`Failed to load invitation: ${error.message}`);
          navigate('/invitation'); // Redirect if fetch fails
        } finally {
          setLoading(false); // End loading
        }
      };
      fetchInvitation();
    } else if (invitation) {
      setLoading(false); // If invitation is already in state, stop loading
    }
  }, [invitation, urlInvitationId, navigate]);

  if (loading) {
    return (
      <div className="invitation-display-container">
        <h2>Loading invitation...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="invitation-display-container">
        <h2>Error: {error}</h2>
        <button onClick={() => navigate('/home')}>Go to Home</button>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="invitation-display-container">
        <h2>No invitation data found.</h2>
        <button onClick={() => navigate('/invitation')}>Create New Invitation</button>
      </div>
    );
  }

  const handleGalleryClick = () => {
    navigate(`/event-gallery/${invitation._id}`); // Navigate to event gallery with ID in URL
  };

  const handleUploadClick = () => {
    // Navigate to upload media page, potentially passing invitation ID
    navigate('/upload-media', { state: { invitationId: invitation._id } });
  };

  const handleShareClick = async () => {
    const invitationUrl = `${window.location.origin}/invitation/${invitation._id}`; // Construct shareable URL
    if (navigator.share) {
      try {
        await navigator.share({
          title: invitation.eventName,
          text: `Check out this invitation for ${invitation.eventName} hosted by ${invitation.invitedBy}!`,
          url: invitationUrl,
        });
        alert('Invitation shared successfully!');
      } catch (error) {
        console.error('Error sharing:', error);
        alert('Failed to share invitation.');
      }
    } else {
      // Fallback for browsers that do not support Web Share API
      navigator.clipboard.writeText(invitationUrl)
        .then(() => {
          alert('Invitation link copied to clipboard!');
        })
        .catch((error) => {
          console.error('Error copying to clipboard:', error);
          alert('Failed to copy invitation link.');
        });
    }
  };

  const handleDeleteClick = async () => {
    if (window.confirm('Are you sure you want to delete this invitation? This action cannot be undone.')) {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          alert('Authentication token missing. Please log in again.');
          return;
        }

        const response = await fetch(`https://invite-backend-vk36.onrender.com/invitations/${invitation._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete invitation.');
        }

        alert('Invitation deleted successfully!');
        navigate('/invitation'); // Redirect to the invitation creation/list page
      } catch (error) {
        console.error('Error deleting invitation:', error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleAcceptClick = async () => {
    if (window.confirm('Do you want to accept this invitation?')) {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          alert('Authentication token missing. Please log in again.');
          return;
        }

        const response = await fetch(`https://invite-backend-vk36.onrender.com/invitations/${invitation._id}/accept`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to accept invitation.');
        }

        alert('Invitation accepted!');
        navigate('/home'); // Or to an 'invited' tab/page
      } catch (error) {
        console.error('Error accepting invitation:', error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  const handleDeclineClick = async () => {
    if (window.confirm('Do you want to decline this invitation?')) {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          alert('Authentication token missing. Please log in again.');
          return;
        }

        const response = await fetch(`https://invite-backend-vk36.onrender.com/invitations/${invitation._id}/decline`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to decline invitation.');
        }

        alert('Invitation declined and removed.');
        navigate('/home'); // Or remove the card from view
      } catch (error) {
        console.error('Error declining invitation:', error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  return (
    <div className="invitation-display-container">
      {/* The header-card is now hidden by CSS */}

      <div className="invitation-card">
        {invitation.invitationImage && (
          <img src={invitation.invitationImage.url} alt="Invitation Card" className="invitation-image" />
        )}
        <div className="invitation-content">
          {/* Add the date as seen in the image, you might need to format it if your backend sends a full timestamp */}
          <p className="event-date">
            {invitation.eventDate 
              ? new Date(invitation.eventDate).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })
              : 'Date Not Available'}
          </p> {/* Placeholder for date/time */}
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
            <button className="action-button gallery-button" onClick={handleGalleryClick}>Gallery</button>
            {loggedInUserEmail === invitation.createdByEmail && (
              <button className="action-button upload-button" onClick={handleUploadClick}>Upload</button>
            )}
            {loggedInUserEmail === invitation.createdByEmail && (
              <button className="action-button share-button" onClick={handleShareClick}>Share</button>
            )}
            {loggedInUserEmail === invitation.createdByEmail && (
              <button className="action-button delete-button" onClick={handleDeleteClick}>Delete</button>
            )}
            {loggedInUserEmail !== invitation.createdByEmail && invitation.eventPrivacy === 'private' && ( // Only show accept/decline for invited users of private invitations
              <button className="action-button accept-button" onClick={handleAcceptClick}>Accept</button>
            )}
            {loggedInUserEmail !== invitation.createdByEmail && invitation.eventPrivacy === 'private' && ( // Only show accept/decline for invited users of private invitations
              <button className="action-button decline-button" onClick={handleDeclineClick}>Decline</button>
            )}
          </div>
        </div>
      </div>

      {/* Optionally keep these buttons or integrate them differently */}
      {/* <button onClick={() => navigate('/home')}>Go to Home</button>
      <button onClick={() => navigate('/invitation')}>Create Another Invitation</button> */}
    </div>
  );
}

export default InvitationDisplay;
