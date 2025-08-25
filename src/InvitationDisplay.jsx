import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './InvitationDisplay.css'; // You'll need to create this CSS file
import LoginModal from './LoginModal'; // Import the LoginModal component
import HomeDisplay from './HomeDisplay'; // Import the new HomeDisplay component

function InvitationDisplay() {
  const location = useLocation();
  const navigate = useNavigate();
  const { invitationId: urlInvitationId } = useParams(); // Get invitation ID from URL
  const [invitation, setInvitation] = useState(location.state?.invitation); // Initialize with state or null
  const [loading, setLoading] = useState(true); // Add loading state
  const [error, setError] = useState(null); // Add error state
  const [showLoginPopup, setShowLoginPopup] = useState(false); // New state for login pop-up
  const [loggedInUserEmail, setLoggedInUserEmail] = useState(localStorage.getItem('userEmail')); // Get logged in user's email

  useEffect(() => {
    console.log("useEffect triggered. Invitation in state:", invitation, "URL ID:", urlInvitationId);
    // If no invitation in state and we have an ID from the URL, try to fetch it
    if (!invitation && urlInvitationId) {
      const fetchInvitation = async () => {
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
      };
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        console.log("Access token missing. Showing login pop-up.");
        setShowLoginPopup(true); // Show login pop-up if not authenticated
        setLoading(false); // Stop loading as we're waiting for login
        return;
      }
      fetchInvitation();
    } else if (invitation) {
      setLoading(false); // If invitation is already in state, stop loading
    }
  }, [invitation, urlInvitationId, navigate, loggedInUserEmail]); // Add loggedInUserEmail to dependencies

  const handleLoginSuccess = () => {
    setLoggedInUserEmail(localStorage.getItem('userEmail')); // Update email after login
    setShowLoginPopup(false); // Hide pop-up
    // The useEffect will re-run because loggedInUserEmail changed, triggering invitation fetch
  };

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
    <div className="invitation-display-container">
      {loading && <h2>Loading invitation...</h2>}
      {error && <h2>Error: {error}</h2>}
      {!loading && !error && (
        <div style={{ filter: showLoginPopup ? 'blur(5px)' : 'none' }}>
          <HomeDisplay
            invitation={invitation}
            loggedInUserEmail={loggedInUserEmail}
            handleGalleryClick={handleGalleryClick}
            handleUploadClick={handleUploadClick}
            handleShareClick={handleShareClick}
            handleDeleteClick={handleDeleteClick}
            handleAcceptClick={handleAcceptClick}
            handleDeclineClick={handleDeclineClick}
          />
        </div>
      )}

      {showLoginPopup && (
        <LoginModal onLoginSuccess={handleLoginSuccess} onClose={() => setShowLoginPopup(false)} />
      )}
    </div>
  );
}

export default InvitationDisplay;
