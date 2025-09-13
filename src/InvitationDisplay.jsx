import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './InvitationDisplay.css'; // You'll need to create this CSS file
import LoginModal from './LoginModal'; // Import the LoginModal component
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
  }, [invitation, urlInvitationId, fetchInvitation]); // Add fetchInvitation to dependencies

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

  return (
    <div className="invitation-page-container">
      <div className="page-content-wrapper" style={{ filter: showLoginPopup ? 'blur(5px)' : 'none' }}>
        <div className="header-bar">
          <button className="back-button" onClick={() => navigate(-1)}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="header-title">Private Invitation Gallery</h2>
        </div>
        {loading ? (
          <p className="loading-message">Loading invitation...</p>
        ) : error ? (
          <p className="error-message">Error: {error}</p>
        ) : invitation ? (
          <div className="invitation-details-section">
            <div className="invitation-card-display">
              <img alt="Invitation Card" className="invitation-image-main" src={invitation.invitationImage?.url || 'https://via.placeholder.com/300'} />
              <div className="invitation-info-box">
                <h3 className="invitation-details-title">All Details of Invitation</h3>
                <div className="detail-list">
                  <div className="detail-item">
                    <span className="material-symbols-outlined detail-icon">celebration</span>
                    <div>
                      <p className="detail-label">Event</p>
                      <p className="detail-value">{invitation.eventName}</p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="material-symbols-outlined detail-icon">calendar_month</span>
                    <div>
                      <p className="detail-label">Date</p>
                      <p className="detail-value">{invitation.dateTime ? new Date(invitation.dateTime).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="material-symbols-outlined detail-icon">schedule</span>
                    <div>
                      <p className="detail-label">Time</p>
                      <p className="detail-value">{invitation.dateTime ? new Date(invitation.dateTime).toLocaleTimeString() : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="material-symbols-outlined detail-icon">location_on</span>
                    <div>
                      <p className="detail-label">Venue</p>
                      <p className="detail-value">{invitation.location}</p>
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="material-symbols-outlined detail-icon">info</span>
                    <div>
                      <p className="detail-label">Additional Details</p>
                      <p className="detail-value">{invitation.description || 'No additional details provided.'}</p>
                    </div>
                  </div>
                </div>
                <div className="share-button-container">
                  <button className="share-button" onClick={handleShareClick}>
                    <span className="material-symbols-outlined">share</span>
                    <span>Share Invitation</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="private-invitations-section">
              <h3 className="private-invitations-title">My Private Invitations</h3>
              <div className="private-invitations-grid">
                {/* Static Private Invitations - to be replaced with dynamic data if needed */}
                <div className="private-invitation-item">
                  <img className="private-invitation-image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAMy08Zl6_WdE1R5x7pQUtNEk66GB5QCdqX4F_013e17exRCJD9cKh-3RKCAED7wWr049R3_cTUXYJqPs4BiKtoGFrtEnJf7GIdkWmExeDBVd_FoJxy5tKrdr4-k9LlMvOqTskXpZVSrqRkO06k39PppyErSFkrJnphIyqYfWdGNpiK1Qz4qWtM_W1C6zzDtBHEdptcZEGYsuuDah2zFjtfjM8ZXTeJ4rBYiyAqWBfxE-K3E-6JSA0t5BklCz_YY63TFVhfor2-Ilk" alt="Birthday Bash Invitation Card" />
                  <div className="private-invitation-overlay">
                    <p className="private-invitation-name">Birthday Bash</p>
                  </div>
                </div>
                <div className="private-invitation-item">
                  <img className="private-invitation-image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAEPqjYhGdN3N_BfVGrBO4SF__Xs_0WXpOqJ6idWkwnekQDoQsPPdnmmbVyleUk_j5XAYBiKD0kmn0DukJlfhmtqQZhMqSUjoPx9rJU2VAQZo3BJw6rnWM-iq9xEE6BEr66G9g-dmo2Ipqyd51ArvUoGHl2rcl5x19_kfwIBk3iCVlk41X5a3SyUrQqy20DKjkUAI4OY6d5SmqQoi9isxIL-GBUkTMaNR7CR_hUFciyB318NWBW-zkM9doy4fmwRaib1AB-CoT0ols" alt="Wedding Celebration Invitation Card" />
                  <div className="private-invitation-overlay">
                    <p className="private-invitation-name">Wedding Celebration</p>
                  </div>
                </div>
                <div className="private-invitation-item">
                  <img className="private-invitation-image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCEz4lzxfDLF5ulYNKVhBjKo7k9y3GMo7DTXDDsBAUDaXiz5HoIqcafI_uI1oX6FW1Q7TOwmkdiB_cOdP5zdE3CKw6YF0a8y6oVsL2MRqSjnw8YdhnvqEZXMPWbYp1Ishe4QzQGBiZNTYB0S_BBET6_jMPdh3RH-eJFeZURo_h1nJxTDVIkpGviNUr49OWDuLr1YcAvKDSHCM3t70TK7F-DJ7jzIiXvT3GdC3Fp8_3OyEjrybxqlxyH-MeHhLMP3SDQTMhUJMWPinU" alt="Anniversary Dinner Invitation Card" />
                  <div className="private-invitation-overlay">
                    <p className="private-invitation-name">Anniversary Dinner</p>
                  </div>
                </div>
                <div className="private-invitation-item">
                  <img className="private-invitation-image" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7CY0j-uJrWGmnZa-B_7Tx1XPKlzfQP_NGNooyFunvZzesSyuOjFs62BOxM5RqFPLMJA8Vi9Q2tVGziAvfhIer7Xiz2Mxe2vGQRwMsb-NS4nMeO7Iv_2LB5wX4uKP0r6O7mBSydqjOPvXWDY6UOrZGk7jVCFp66PcsbaKhRfd-erq7lfSYGDa53NQm6cvS5LvHaegNuplZVcJvxAUpNK_WgmOH_ECb4j4DCNBDswNijgGVCN38-JWgKn1oZ7U2h50kdd5XXpbARss" alt="Graduation Party Invitation Card" />
                  <div className="private-invitation-overlay">
                    <p className="private-invitation-name">Graduation Party</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="no-invitation-message">No invitation data found.</p>
        )}
      </div>
      <nav className="bottom-navigation">
        <div className="nav-links-container">
          <a className="nav-link" onClick={() => navigate('/home')}>
            <span className="material-symbols-outlined">home</span>
            <p className="nav-link-text">Home</p>
          </a>
          <a className="nav-link" onClick={() => navigate('/invitation', { state: { showForm: true } })}>
            <span className="material-symbols-outlined">add_box</span>
            <p className="nav-link-text">Create</p>
          </a>
          <a className="nav-link active" onClick={() => navigate('/event-gallery')}>
            <span className="material-symbols-outlined">photo_library</span>
            <p className="nav-link-text">Gallery</p>
          </a>
          <a className="nav-link" onClick={() => navigate('/profile')}>
            <span className="material-symbols-outlined">person</span>
            <p className="nav-link-text">Profile</p>
          </a>
        </div>
        <div className="bottom-nav-spacer"></div>
      </nav>
      {showLoginPopup && (
        <LoginModal onLoginSuccess={handleLoginSuccess} onClose={() => setShowLoginPopup(false)} />
      )}
    </div>
  );
}

export default InvitationDisplay;
