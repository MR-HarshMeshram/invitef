import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import './InvitationGalleryPage.css'; // Custom CSS for this page
import LoginModal from './LoginModal'; // Import the LoginModal component

function InvitationGalleryPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { invitationId: urlInvitationId } = useParams();

  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(false); // Changed initial state to false
  const [error, setError] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [loggedInUserEmail, setLoggedInUserEmail] = useState(localStorage.getItem('userEmail'));
  const [hasAccepted, setHasAccepted] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null); // For image modal in gallery
  const [hoveredMediaId, setHoveredMediaId] = useState(null); // For delete button on media
  const [selectedUploadFile, setSelectedUploadFile] = useState(null); // New state for file to upload
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState(''); // New state for upload image preview
  const uploadFileInputRef = useRef(null); // Ref for hidden file input
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

      // Check if the logged-in user has accepted or declined this invitation
      const currentLoggedInUserEmail = localStorage.getItem('userEmail');
      if (currentLoggedInUserEmail) {
        setHasAccepted(data.acceptedUsers.includes(currentLoggedInUserEmail));
        setLoggedInUserEmail(currentLoggedInUserEmail); // Update state if changed
      }

    } catch (error) {
      console.error('Error fetching invitation:', error);
      setError(error.message);
      // navigate('/home'); // Redirect if fetch fails, maybe to home or a generic error page
    } finally {
      setLoading(false);
    }
  }, [urlInvitationId, loggedInUserEmail]);

  // Removed fetchPrivateInvitations as it's no longer needed for this section

  useEffect(() => {
    if (urlInvitationId) {
      const accessToken = localStorage.getItem('accessToken');
      const userEmail = localStorage.getItem('userEmail'); // Get user email directly

      if (!accessToken || !userEmail) {
        setShowLoginPopup(true);
        localStorage.setItem('pendingInvitationId', urlInvitationId);
        setLoading(false);
        setLoggedInUserEmail(null); // Explicitly set to null if not logged in
      } else if (accessToken && userEmail) {
        setLoggedInUserEmail(userEmail); // Ensure state is updated if logged in
        fetchInvitation();
      }
    }
  }, [urlInvitationId, fetchInvitation]); // Depend on fetchInvitation only

  const handleLoginSuccess = () => {
    setLoggedInUserEmail(localStorage.getItem('userEmail')); // Ensure this is up to date
    setShowLoginPopup(false);
    const pendingInvitationId = localStorage.getItem('pendingInvitationId');
    if (pendingInvitationId) {
      localStorage.removeItem('pendingInvitationId');
      navigate(`/invitation/${pendingInvitationId}`, { replace: true });
    } else if (urlInvitationId) {
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
    // Trigger the hidden file input
    uploadFileInputRef.current.click();
  };

  const handleFileSelectForUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PNG or JPG image.');
        return;
      }

      if (file.size > maxSize) {
        alert('File size exceeds 10MB.');
        return;
      }

      setSelectedUploadFile(file);
      setUploadPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handlePerformUpload = async () => {
    if (!selectedUploadFile) {
      alert('Please select an image to upload.');
      return;
    }

    // Disable buttons and show loading if needed
    // setIsLoading(true);
    // setError(null);

    const formData = new FormData();
    formData.append('media', selectedUploadFile);
    formData.append('invitationId', urlInvitationId); // Add invitationId to form data

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('Authentication token missing. Please log in again.');
        return;
      }

      const uploadUrl = `https://invite-backend-vk36.onrender.com/invitations/media/upload`; // Corrected URL

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = 'Failed to upload media.';
        const clonedResponse = response.clone(); // Clone the response before trying to read it
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // If response is not JSON (e.g., HTML error page), read as text from the cloned response
          const errorText = await clonedResponse.text();
          errorMessage = `Server error: ${response.status} - ${errorText.substring(0, 150)}...`; // Limit text length
        }
        throw new Error(errorMessage);
      }

      alert('Media uploaded successfully!');
      setSelectedUploadFile(null);
      setUploadPreviewUrl('');
      fetchInvitation(); // Refresh the current invitation to show new media
    } catch (err) {
      console.error('Error uploading media:', err);
      alert('Upload failed: ' + err.message);
    } finally {
      // setIsLoading(false);
    }
  };

  const handleAcceptInvite = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const userEmail = localStorage.getItem('userEmail');

      if (!accessToken || !userEmail) {
        alert('Please log in to accept the invitation.');
        setShowLoginPopup(true);
        localStorage.setItem('pendingInvitationId', urlInvitationId);
        return;
      }

      const response = await fetch(`https://invite-backend-vk36.onrender.com/invitations/${urlInvitationId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept invitation.');
      }

      alert('Invitation accepted!');
      fetchInvitation(); // Refresh invitation data
    } catch (error) {
      console.error('Error accepting invitation:', error);
      alert(`Error accepting invitation: ${error.message}`);
    }
  };

  const handleDeclineInvite = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const userEmail = localStorage.getItem('userEmail');

      if (!accessToken || !userEmail) {
        alert('Please log in to decline the invitation.');
        setShowLoginPopup(true);
        localStorage.setItem('pendingInvitationId', urlInvitationId);
        return;
      }

      const response = await fetch(`https://invite-backend-vk36.onrender.com/invitations/${urlInvitationId}/decline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ userEmail }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to decline invitation.');
      }

      alert('Invitation declined.');
      fetchInvitation(); // Refresh invitation data
    } catch (error) {
      console.error('Error declining invitation:', error);
      alert(`Error declining invitation: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="invitation-gallery-page-container">Loading invitation...</div>;
  }

  if (error) {
    return <div className="invitation-gallery-page-container">Error: {error}</div>;
  }

  if (!invitation && !showLoginPopup && !loading) { // Added !loading and !showLoginPopup
    return <div className="invitation-gallery-page-container">No invitation found.</div>;
  }

  return (
    <div className="invitation-gallery-page-container">
      {showLoginPopup && (
        <LoginModal onLoginSuccess={handleLoginSuccess} onClose={() => setShowLoginPopup(false)} />
      )}

      {!showLoginPopup && invitation && (
        <>
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

              {loggedInUserEmail && invitation.createdByEmail !== loggedInUserEmail && !hasAccepted && !invitation.declinedUsers.includes(loggedInUserEmail) && (
                <div className="response-buttons">
                  <button className="accept-invite-button" onClick={handleAcceptInvite}>
                    <span className="material-symbols-outlined">check_circle</span> Accept Invite
                  </button>
                  <button className="decline-invite-button" onClick={handleDeclineInvite}>
                    <span className="material-symbols-outlined">cancel</span> Reject Invite
                  </button>
                </div>
              )}
            </section>

            {loggedInUserEmail === invitation.createdByEmail && (
              <div className="upload-media-section">
                <button type="button" className="upload-media-button" onClick={handleUploadClick}>
                  <span className="material-symbols-outlined">cloud_upload</span> Upload Image
                </button>
                <input
                  type="file"
                  ref={uploadFileInputRef}
                  style={{ display: 'none' }}
                  accept=".png,.jpg,.jpeg"
                  onChange={handleFileSelectForUpload}
                />
                {uploadPreviewUrl && (
                  <div className="upload-preview-container">
                    <img src={uploadPreviewUrl} alt="Upload Preview" className="upload-preview-image" />
                    <button type="button" className="remove-upload-preview-button" onClick={() => { setSelectedUploadFile(null); setUploadPreviewUrl(''); }}>&times;</button>
                    <button type="button" className="perform-upload-button" onClick={handlePerformUpload}>Perform Upload</button>
                  </div>
                )}
              </div>
            )}

            {invitation.eventMedia && invitation.eventMedia.length > 0 && (
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
        </>
      )}
    </div>
  );
}

export default InvitationGalleryPage;
