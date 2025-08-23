import React, { useState } from 'react';
import './EventGallery.css';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';

function EventGallery() {
  const [selectedImage, setSelectedImage] = useState(null);
  const location = useLocation();
  const { invitationId } = location.state || {};
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const loggedInUserEmail = localStorage.getItem('userEmail'); // Re-introduce logged in user's email
  const [hoveredMediaId, setHoveredMediaId] = useState(null); // State to manage hovered media item

  useEffect(() => {
    const fetchInvitationMedia = async () => {
      if (!invitationId) {
        setError('No Invitation ID provided.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/invitations/${invitationId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch invitation media.');
        }
        const data = await response.json();
        setInvitation(data.invitation);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInvitationMedia();
  }, [invitationId]);

  // Filter images and videos from eventMedia
  const eventImages = invitation?.eventMedia?.filter(media => media.url.match(/\.(jpeg|jpg|png|gif)$/i)) || [];
  const eventVideos = invitation?.eventMedia?.filter(media => media.url.match(/\.(mp4|mov|avi|wmv)$/i)) || [];

  const images = [
    // Using actual uploaded media instead of placeholders
    ...eventImages.map((media, index) => ({ id: `img-${index}`, title: `Image ${index + 1}`, src: media.url, public_id: media.public_id, createdByEmail: invitation.createdByEmail })),
    ...eventVideos.map((media, index) => ({ id: `vid-${index}`, title: `Video ${index + 1}`, src: media.url, time: 'N/A', public_id: media.public_id, createdByEmail: invitation.createdByEmail })),
  ];

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleDownload = () => {
    if (selectedImage && selectedImage.src) {
      const link = document.createElement('a');
      link.href = selectedImage.src;
      link.download = selectedImage.title || 'media'; // Suggest a filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDeleteMedia = async (e, publicId) => {
    e.stopPropagation(); // Prevent image card click from opening modal
    if (window.confirm('Are you sure you want to delete this media?')) {
      try {
        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          alert('Authentication token missing. Please log in again.');
          return;
        }

        // Replace with your actual delete media API endpoint
        const deleteUrl = `http://localhost:5000/invitations/media/${invitationId}/${publicId}`;
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
        // Refresh the invitation data to update the gallery
        // A simple way is to refetch all data:
        setLoading(true);
        setError(null);
        fetch(`http://localhost:5000/invitations/${invitationId}`)
          .then(res => res.json())
          .then(data => setInvitation(data.invitation))
          .catch(err => setError(err.message))
          .finally(() => setLoading(false));

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
