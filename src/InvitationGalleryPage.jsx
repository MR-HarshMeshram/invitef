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

  // Removed fetchPrivateInvitations as it's no longer needed for this section

  useEffect(() => {
    if (urlInvitationId) {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setShowLoginPopup(true);
        localStorage.setItem('pendingInvitationId', urlInvitationId);
        setLoading(false);
      } else {
        fetchInvitation();
        // fetchPrivateInvitations(); // Removed this call
      }
    }
  }, [urlInvitationId, fetchInvitation]); // Removed fetchPrivateInvitations from dependencies

  const handleLoginSuccess = () => {
    setLoggedInUserEmail(localStorage.getItem('userEmail'));
    setShowLoginPopup(false);
    if (urlInvitationId) {
      fetchInvitation();
      // fetchPrivateInvitations(); // Removed this call
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

  const handleEditClick = () => {
    navigate(`/edit-invitation/${urlInvitationId}`);
  };

  const handleDeleteClick = () => {
    if (window.confirm('Are you sure you want to delete this invitation?')) {
      deleteInvitation();
    }
  };

  const deleteInvitation = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('Authentication token missing. Please log in again.');
        return;
      }

      const deleteUrl = `https://invite-backend-vk36.onrender.com/invitations/${urlInvitationId}`;
      const response = await fetch(deleteUrl, {
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
      navigate('/home'); // Redirect to home or a generic success page
    } catch (error) {
      console.error('Error deleting invitation:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleUploadClick = () => {
    navigate(`/upload-media/${urlInvitationId}`);
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
          {loggedInUserEmail === invitation.createdByEmail && (
            <div className="owner-actions">
              <button className="action-button edit-button" onClick={handleEditClick}>
                <span className="material-symbols-outlined">edit</span> Edit
              </button>
              <button className="action-button delete-button" onClick={handleDeleteClick}>
                <span className="material-symbols-outlined">delete</span> Delete
              </button>
            </div>
          )}

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

        {loggedInUserEmail === invitation.createdByEmail && (
          <div className="upload-media-section">
            <button className="upload-media-button" onClick={handleUploadClick}>
              <span className="material-symbols-outlined">cloud_upload</span> Upload Image
            </button>
          </div>
        )}

        {invitation.eventMedia && invitation.eventMedia.length > 0 && ( // Display Event Media Gallery
          <section className="event-media-gallery-section">
            <h2 className="section-heading">Event Media Gallery</h2>
            <div className="event-media-grid">
              {invitation.eventMedia.map((media) => (
                <div className="event-media-card" key={media.public_id} onClick={() => handleImageClick({ src: media.url, title: media.original_filename, public_id: media.public_id })}>
                  <img src={media.url} alt={media.original_filename} className="event-media-image" />
                  <p className="event-media-title">{media.original_filename}</p>
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
