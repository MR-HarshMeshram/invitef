import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './InvitationDisplay.css';
import LoginModal from './LoginModal'; // Import the LoginModal component
import './material-symbols-outlined.css'; // Import for Material Symbols Outlined
// hi
function InvitationDisplay() {
  const location = useLocation();
  const navigate = useNavigate();
  const { invitationId: urlInvitationId } = useParams(); // Get invitation ID from URL
  const [invitation, setInvitation] = useState(location.state?.invitation); // Initialize with state or null
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state
  const [showLoginPopup, setShowLoginPopup] = useState(false); // New state for login pop-up
  const [loggedInUserEmail, setLoggedInUserEmail] = useState(localStorage.getItem('userEmail')); // Get logged in user's email
  const [hasAccepted, setHasAccepted] = useState(false); // New state to track if invitation has been accepted
  const [privateInvitations, setPrivateInvitations] = useState([]);
  const [allInvitations, setAllInvitations] = useState([]);

  // Memoized function to fetch invitation details
  const fetchInvitation = React.useCallback(async () => {
    setLoading(true); // Start loading
    setError(null); // Clear previous errors
    try {
      const accessToken = localStorage.getItem('accessToken');

      // Only include Authorization header if an access token is available
      const headers = accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {};

      console.log(`Fetching invitation with ID: ${urlInvitationId}`);
      const response = await fetch(`https://invite-backend-vk36.onrender.com/invitations/${urlInvitationId}`, { headers });

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
  }, [urlInvitationId, navigate]); // Dependencies for useCallback

  // Memoized function to fetch private invitations for the logged-in user
  const fetchPrivateInvitations = React.useCallback(async () => {
    const userEmail = localStorage.getItem('userEmail');
    if (!userEmail) {
      console.log("User email not found. Cannot fetch private invitations.");
      return;
    }
    try {
      const accessToken = localStorage.getItem('accessToken');
      const headers = accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {};
      const response = await fetch(`https://invite-backend-vk36.onrender.com/invitations/private/${userEmail}`, { headers });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch private invitations.');
      }
      const data = await response.json();
      setPrivateInvitations(data.invitations);
    } catch (error) {
      console.error('Error fetching private invitations:', error);
    }
  }, []); // No dependencies for useCallback, as it only uses localStorage and does not depend on component state or props

  useEffect(() => {
    console.log("useEffect triggered. Invitation in state:", invitation, "URL ID:", urlInvitationId);
    // If no invitation in state and we have an ID from the URL, try to fetch it
    if (!invitation && urlInvitationId) {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        console.log("Access token missing. Showing login pop-up.");
        setShowLoginPopup(true); // Show login pop-up if not authenticated
        setLoading(false); // Stop loading as we're waiting for login
        localStorage.setItem('pendingInvitationId', urlInvitationId); // Save ID for post-login redirect
        return;
      }
      fetchInvitation();
    } else if (invitation) {
      setLoading(false); // If invitation is already in state, stop loading
    }
    fetchPrivateInvitations(); // Fetch private invitations when component mounts or invitation changes
  }, [invitation, urlInvitationId, fetchInvitation, fetchPrivateInvitations]); // Add fetchPrivateInvitations to dependencies

  const handleLoginSuccess = () => {
    setLoggedInUserEmail(localStorage.getItem('userEmail')); // Update email after login
    setShowLoginPopup(false); // Hide pop-up
    // After successful login, attempt to refetch the invitation
    if (urlInvitationId) {
      fetchInvitation();
    }
  };

  const handleGalleryClick = () => {
    navigate(`/event-gallery/${invitation._id}`); // Navigate to event gallery with ID in URL
  };

  const handleUploadClick = () => {
    // Navigate to upload media page, potentially passing invitation ID
    navigate('/upload-media', { state: { invitationId: invitation._id } });
  };

  const handleEditClick = () => {
    navigate('/invitation', { state: { invitation, isEditing: true } });
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
          setShowLoginPopup(true); // Show login pop-up if not authenticated
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
        setHasAccepted(true); // Set hasAccepted to true upon successful acceptance
        // Navigate to the 'invited' page/tab and pass the accepted invitation
        navigate('/invited', { state: { acceptedInvitation: invitation } });
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
          setShowLoginPopup(true); // Show login pop-up if not authenticated
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

  const handleInvitationCardClick = (privateInv) => {
    setInvitation(privateInv); // Set the selected private invitation as the main invitation
    setLoading(false); // Stop loading as we have the invitation
    setShowLoginPopup(false); // Hide login pop-up if it was shown
  };

  return (
    <div className="invitation-page-container">
      <header className="header-bar">
        <button className="header-back-button" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="header-title">Private Invitation Gallery</h2>
      </header>
      {loading && <p>Loading invitation...</p>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {!loading && !error && invitation && (
        <div className="content-padding" style={{ filter: showLoginPopup ? 'blur(5px)' : 'none' }}>
          <div className="invitation-details-card">
            {invitation.invitationImage && (
              <img src={invitation.invitationImage.url} alt="Invitation Card" className="invitation-image-display" />
            )}
            <div className="details-content">
              <h3 className="details-title">All Details of Invitation</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="material-symbols-outlined detail-icon">celebration</span>
                  <div>
                    <p className="detail-label">Event</p>
                    <p className="detail-value">{invitation.eventName}</p>
                  </div>
                </div>
                {invitation.dateTime && (
                  <div className="detail-item">
                    <span className="material-symbols-outlined detail-icon">calendar_month</span>
                    <div>
                      <p className="detail-label">Date</p>
                      <p className="detail-value">{new Date(invitation.dateTime).toLocaleDateString()}</p>
                    </div>
                  </div>
                )}
                {invitation.dateTime && (
                  <div className="detail-item">
                    <span className="material-symbols-outlined detail-icon">schedule</span>
                    <div>
                      <p className="detail-label">Time</p>
                      <p className="detail-value">{new Date(invitation.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} onwards</p>
                    </div>
                  </div>
                )}
                {invitation.location && (
                  <div className="detail-item">
                    <span className="material-symbols-outlined detail-icon">location_on</span>
                    <div>
                      <p className="detail-label">Venue</p>
                      <p className="detail-value">{invitation.location}</p>
                    </div>
                  </div>
                )}
                {invitation.additionalDetails && (
                  <div className="detail-item">
                    <span className="material-symbols-outlined detail-icon">info</span>
                    <div>
                      <p className="detail-label">Additional Details</p>
                      <p className="detail-value">{invitation.additionalDetails}</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="share-button-container">
                <button className="share-button" onClick={handleShareClick}>
                  <span className="material-symbols-outlined">share</span>
                  <span>Share Invitation</span>
                </button>
              </div>
            </div>
          </div>
          {privateInvitations.length > 0 && (
            <div className="private-invitations-section">
              <h3 className="private-invitations-title">My Private Invitations</h3>
              <div className="private-invitations-grid">
                {privateInvitations.map((privateInv) => (
                  <div className="private-invitation-card" key={privateInv._id} onClick={() => handleInvitationCardClick(privateInv)}>
                    <img className="private-invitation-image" src={privateInv.invitationImage?.url || 'https://via.placeholder.com/150'} alt={privateInv.eventName} />
                    <div className="private-invitation-overlay"></div>
                    <div className="private-invitation-name">
                      <p>{privateInv.eventName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {showLoginPopup && (
        <LoginModal onLoginSuccess={handleLoginSuccess} onClose={() => setShowLoginPopup(false)} />
      )}
      <nav className="bottom-nav-container">
        <div className="bottom-nav-items">
          <a className="nav-item" onClick={() => navigate('/home')}>
            <span className="material-symbols-outlined nav-icon">home</span>
            <span className="nav-text">Home</span>
          </a>
          <a className="nav-item" onClick={() => navigate('/invitation')}>
            <span className="material-symbols-outlined nav-icon">add_box</span>
            <span className="nav-text">Create</span>
          </a>
          <a className="nav-item active" onClick={() => navigate('/invited')}>
            <span className="material-symbols-outlined nav-icon">photo_library</span>
            <span className="nav-text">Gallery</span>
          </a>
          <a className="nav-item" onClick={() => navigate('/profile')}>
            <span className="material-symbols-outlined nav-icon">person</span>
            <span className="nav-text">Profile</span>
          </a>
        </div>
      </nav>
    </div>
  );
}

export default InvitationDisplay;
