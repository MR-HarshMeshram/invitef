import React, { useState } from 'react';
import './EventGallery.css';
import { useLocation, useParams } from 'react-router-dom';
import { useEffect } from 'react';

function EventGallery() {
  const [selectedImage, setSelectedImage] = useState(null);
  const location = useLocation();
  const { invitationId: urlInvitationId } = useParams(); // Get invitationId from URL parameters
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const loggedInUserEmail = localStorage.getItem('userEmail'); // Re-introduce logged in user's email
  const [hoveredMediaId, setHoveredMediaId] = useState(null); // State to manage hovered media item

  useEffect(() => {
    const fetchInvitationMedia = async () => {
      if (!urlInvitationId) {
        setError('No Invitation ID provided in URL.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`https://invite-backend-vk36.onrender.com/invitations/${urlInvitationId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch invitation media.');
        }
        const data = await response.json();
        setInvitation(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitationMedia();
  }, [urlInvitationId]);

  // Filter images and videos from eventMedia
  const eventImages = invitation?.eventMedia?.filter(media => media.url.match(/\.(jpeg|jpg|png|gif)$/i)) || [];
  const eventVideos = invitation?.eventMedia?.filter(media => media.url.match(/\.(mp4|mov|avi|wmv)$/i)) || [];

  const images = [
    // Using actual uploaded media instead of placeholders
    ...(eventImages || []).map(media => ({
      id: media.public_id,
      public_id: media.public_id,
      src: media.url,
      title: 'Event Image',
      createdByEmail: invitation?.createdByEmail,
    })),
    // Add videos as well, if you want them in the general gallery view, with a play icon overlay
    ...(eventVideos || []).map(media => ({
      id: media.public_id,
      public_id: media.public_id,
      src: media.url,
      title: 'Event Video',
      time: '0:00', // Placeholder for video duration
      type: 'video',
      createdByEmail: invitation?.createdByEmail,
    })),
  ];

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleDownload = () => {
    if (selectedImage && selectedImage.src) {
      console.log('Attempting to download image:', selectedImage.src);
      const link = document.createElement('a');
      link.href = selectedImage.src;
      link.download = selectedImage.title || 'media'; // Suggest a filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('Download link clicked and removed from DOM.');
    } else {
      console.log('No selected image or image source found for download.');
    }
  };

  const handleDeleteMedia = async (e, publicId) => {
    e.stopPropagation(); // Prevent image modal from opening
    if (window.confirm('Are you sure you want to delete this media?')) {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          alert('Authentication token missing. Please log in again.');
          return;
        }

        // Replace with your actual delete media API endpoint
        const deleteUrl = `https://invite-backend-vk36.onrender.com/invitations/media/${urlInvitationId}/${publicId}`;
        console.log('Frontend: Deleting media with URL:', deleteUrl);
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
        // Refresh invitation data after deletion
        setLoading(true);
        setError(null);
        fetch(`https://invite-backend-vk36.onrender.com/invitations/${urlInvitationId}`)
          .then(res => res.json())
          .then(data => setInvitation(data))
          .catch(err => setError(err.message))
          .finally(() => setLoading(false));

        if (selectedImage && selectedImage.public_id === publicId) {
          setSelectedImage(null); // Close modal if the deleted image was open
        }
      } catch (error) {
        console.error('Error deleting media:', error);
        alert(`Error: ${error.message}`);
      }
    }
  };

  if (loading) {
    return <div className="event-gallery-container">Loading gallery...</div>;
  }

  if (error) {
    return <div className="event-gallery-container">Error: {error}</div>;
  }

  if (!invitation) {
    return <div className="event-gallery-container">No invitation found.</div>;
  }

  return (
    <div className="event-gallery-container">
      <div className="header">
        <div className="back-arrow">&larr;</div>
        <div className="title-section">
          <h3>Event Gallery</h3>
          <p>{invitation.eventName} | {invitation.location}</p>
        </div>
      </div>

      <div className="event-summary-card">
        {invitation.invitationImage && (
          <img src={invitation.invitationImage.url} alt="Invitation" className="event-summary-image" />
        )}
        {!invitation.invitationImage && (
          <span className="music-icon">🎵</span>
        )}
        <p className="event-date">{new Date(invitation.createdAt).toLocaleDateString()}</p>
        <h4 className="event-name">{invitation.eventName}</h4>
        <p className="event-price">Hosted by: {invitation.invitedBy}</p> {/* Placeholder for price */}
      </div>

      <div className="counts-section">
        <div className="count-item">
          <p className="count-number">{eventImages.length}</p>
          <p className="count-label">Photos</p>
        </div>
        <div className="count-item">
          <p className="count-number">{eventVideos.length}</p>
          <p className="count-label">Videos</p>
        </div>
        <div className="count-item">
          <p className="count-number">0</p>
          <p className="count-label">Stories</p>
        </div>
      </div>

      <div className="gallery-section">
        <div className="gallery-header">
          <span className="camera-icon">📸</span>
          <h4>Event Gallery</h4>
        </div>
        <div className="image-grid">
          {images.length > 0 ? ( /* Check if there are images to display */
            images.map((image) => (
              <div
                key={image.id}
                className="image-card"
                onClick={() => handleImageClick(image)}
                onMouseEnter={() => setHoveredMediaId(image.id)}
                onMouseLeave={() => setHoveredMediaId(null)}
                style={{ cursor: 'pointer' }}
              >
                <img src={image.src} alt={image.title} className="gallery-thumbnail" />
                {image.time && <span className="video-time">{image.time}</span>}
                {loggedInUserEmail === image.createdByEmail && hoveredMediaId === image.id && (
                  <button className="delete-media-button" onClick={(e) => handleDeleteMedia(e, image.public_id)}>
                    &times;
                  </button>
                )}
              </div>
            ))
          ) : (
            <p>No media uploaded for this event yet.</p>
          )}
        </div>
      </div>

      {selectedImage && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <span className="close-button" onClick={handleCloseModal}>&times;</span>
            <img src={selectedImage.src} alt={selectedImage.title} className="modal-image" />
            <p>{selectedImage.title}</p>
            {loggedInUserEmail === selectedImage.createdByEmail ? (
              <button className="download-button" onClick={(e) => handleDeleteMedia(e, selectedImage.public_id)}>Delete</button> // Use download button style for delete
            ) : (
              <button className="download-button" onClick={handleDownload}>Download</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default EventGallery;
