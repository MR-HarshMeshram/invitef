import React, { useEffect, useState, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './InvitationGalleryPage.css'; // Custom CSS for this page
import LoginModal from './LoginModal'; // Import the LoginModal component

function InvitationGalleryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { invitationId: urlInvitationId } = useParams();

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loggedInUserEmail, setLoggedInUserEmail] = useState(localStorage.getItem('userEmail'));
  const [hasAccepted, setHasAccepted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // For image modal in gallery
  const [hoveredMediaId, setHoveredMediaId] = useState(null); // For delete button on media
  const [privateInvitations, setPrivateInvitations] = useState([]); // For "My Private Invitations"

  const fetchInvitation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const accessToken = localStorage.getItem('accessToken');
      const headers = accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {};

      const response = await fetch(`https://invite-backend-vk36.onrender.com/invitations/${urlInvitationId}`, { headers });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch invitation.');
      }
      const data = await response.json();
      setInvitation(data);
    } catch (error) {
      console.error('Error fetching invitation:', error);
      setError(error.message);
      // navigate('/home'); // Redirect if fetch fails, maybe to home or a generic error page
    } finally {
      setLoading(false);
    }
  }, [urlInvitationId]);

  const fetchPrivateInvitations = useCallback(async () => {
    // This function will fetch a list of private invitations for the logged-in user
    // For now, I'll mock this or adapt an existing API call if available.
    // Assuming a user-specific endpoint exists, or filtering from all invitations.
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        // If not logged in, can't fetch private invitations, so return empty
        setPrivateInvitations([]);
        return;
      }

      const response = await fetch('https://invite-backend-vk36.onrender.com/invitations/user', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch private invitations.');
      }
      const data = await response.json();
      console.log("Fetched private invitations data:", data.invitations); // Add this line for debugging
      setPrivateInvitations(data.invitations || []);
    } catch (error) {
      console.error('Error fetching private invitations:', error);
      setPrivateInvitations([]); // Ensure it's empty on error
    }
  }, []); // Dependencies for useCallback

  useEffect(() => {
    if (urlInvitationId) {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setShowLoginPopup(true);
        localStorage.setItem('pendingInvitationId', urlInvitationId);
        setLoading(false);
      } else {
        fetchInvitation();
        fetchPrivateInvitations(); // Fetch private invitations when logged in
      }
    }
  }, [urlInvitationId, fetchInvitation, fetchPrivateInvitations]);

  const handleLoginSuccess = () => {
    setLoggedInUserEmail(localStorage.getItem('userEmail'));
    setShowLoginPopup(false);
    if (urlInvitationId) {
      fetchInvitation();
      fetchPrivateInvitations(); // Refetch private invitations after login
    }
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

  const handleDeleteMedia = async (e, publicId) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this media?')) {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          alert('Authentication token missing. Please log in again.');
          return;
        }

        const deleteUrl = `https://invite-backend-vk36.onrender.com/invitations/media/${urlInvitationId}/${publicId}`;
        const response = await fetch(deleteUrl, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete media.');
        }

        alert('Media deleted successfully!');
        fetchInvitation(); // Refresh the current invitation to reflect deleted media
        if (selectedImage && selectedImage.public_id === publicId) {
          setSelectedImage(null);
        }
      } catch (error) {
        console.error('Error deleting media:', error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  // Filter images and videos from eventMedia of the current invitation
  const eventImages = invitation?.eventMedia?.filter(media => media.url.match(/\.(jpeg|jpg|png|gif)$/i)) || [];
  // const eventVideos = invitation?.eventMedia?.filter(media => media.url.match(/\.(mp4|mov|avi|wmv)$/i)) || [];

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleDownload = async () => {
    if (selectedImage && selectedImage.src) {
      try {
        const response = await fetch(selectedImage.src);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = selectedImage.title || 'media';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Error downloading image:', error);
        alert('Failed to download image. Please try again.');
      }
    }
  };

  const handleInvitationCardClick = (invitationItem) => {
    // Navigate to the same InvitationGalleryPage with the clicked invitation's ID
    navigate(`/invitation/${invitationItem._id}`);
  };

  if (loading) {
    return <div className="invitation-gallery-page-container">Loading invitation...</div>;
  }

  if (error) {
    return <div className="invitation-gallery-page-container">Error: {error}</div>;
  }

  if (!invitation) {
    return <div className="invitation-gallery-page-container">No invitation found.</div>;
  }

  return (
    <div className="invitation-gallery-page-container">
      <header className="gallery-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="gallery-title">Private Invitation Gallery</h1>
      </header>

      <main className="gallery-content">
        <div className="invitation-card-display">
          {invitation.invitationImage ? (
            <img src={invitation.invitationImage.url} alt="Invitation Card" className="main-invitation-image" />
          ) : (
            <div className="no-image-placeholder">No Image Available</div>
          )}
        </div>

        <section className="invitation-details-section">
          <h2 className="section-heading">All Details of Invitation</h2>
          <div className="detail-item">
            <span className="material-symbols-outlined">event</span>
            <p>Event: {invitation.eventName}</p>
          </div>
          <div className="detail-item">
            <span className="material-symbols-outlined">calendar_today</span>
            <p>Date: {new Date(invitation.dateTime).toLocaleDateString()}</p>
          </div>
          <div className="detail-item">
            <span className="material-symbols-outlined">schedule</span>
            <p>Time: {new Date(invitation.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} onwards</p>
          </div>
          <div className="detail-item">
            <span className="material-symbols-outlined">location_on</span>
            <p>Venue: {invitation.location}</p>
          </div>
          {invitation.description && (
            <div className="detail-item">
              <span className="material-symbols-outlined">info</span>
              <p>Additional Details: {invitation.description}</p>
            </div>
          )}

          <button className="share-invitation-button" onClick={handleShareClick}>
            <span className="material-symbols-outlined">share</span>
            Share Invitation
          </button>
        </section>

        {privateInvitations.length > 0 && (
          <section className="my-private-invitations-section">
            <h2 className="section-heading">Invitations Gallery</h2>
            <div className="private-invitations-grid">
              {privateInvitations.map((privateInv) => (
                <div className="private-invitation-card" key={privateInv._id} onClick={() => handleInvitationCardClick(privateInv)}>
                  {privateInv.invitationImage && (
                    <img src={privateInv.invitationImage.url} alt={privateInv.eventName} className="private-invitation-image" />
                  )}
                  <p className="private-invitation-title">{privateInv.eventName}</p>
                </div>
              ))}
            </div>
          </section>
        )}

      </main>

      {selectedImage && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-button" onClick={handleCloseModal}>&times;</span>
            <img src={selectedImage.src} alt={selectedImage.title} className="modal-image" />
            <p>{selectedImage.title}</p>
            {loggedInUserEmail === invitation.createdByEmail ? (
              <button className="modal-action-button delete-button" onClick={(e) => handleDeleteMedia(e, selectedImage.public_id)}>Delete</button>
            ) : (
              <button className="modal-action-button download-button" onClick={handleDownload}>Download</button>
            )}
          </div>
        </div>
      )}

      {showLoginPopup && (
        <LoginModal onLoginSuccess={handleLoginSuccess} onClose={() => setShowLoginPopup(false)} />
      )}
    </div>
  );
}

export default InvitationGalleryPage;
