import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './InvitationForm.css';
import { useLocation } from 'react-router-dom'; // Added useLocation import

function InvitationForm() {
  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [invitedBy, setInvitedBy] = useState('');
  const [eventPrivacy, setEventPrivacy] = useState('private');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false); // New state for loading form submission
  const [error, setError] = useState(null); // New state for form submission errors
  const [userInvitations, setUserInvitations] = useState([]); // New state for user's invitations
  const [isFetchingInvitations, setIsFetchingInvitations] = useState(true); // New state for fetching invitations
  const [fetchError, setFetchError] = useState(null); // New state for fetching errors
  const [showCreateForm, setShowCreateForm] = useState(false); // Controls visibility of the creation form, initially hidden
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const locationHook = useLocation(); // Use useLocation hook

  // Check for navigation state on initial load
  useEffect(() => {
    if (locationHook.state && locationHook.state.showForm) {
      setShowCreateForm(true);
      // Clear the state so it doesn't persist if the user navigates away and back
      navigate(locationHook.pathname, { replace: true, state: {} });
    }
    fetchUserInvitations();
  }, [locationHook.state, navigate]); // Add locationHook.state and navigate to dependencies

  // Function to fetch invitations
  const fetchUserInvitations = async () => {
    setIsFetchingInvitations(true);
    setFetchError(null);
    const userEmail = localStorage.getItem('userEmail');
    const accessToken = localStorage.getItem('accessToken');

    if (!userEmail || !accessToken) {
      setFetchError('User not logged in or token missing. Please log in again to view your invitations.');
      setIsFetchingInvitations(false);
      // Ensure the form is hidden if user is not logged in
      setShowCreateForm(false); 
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/invitations/user/${userEmail}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch invitations.');
      }

      const result = await response.json();
      setUserInvitations(result.invitations);

      // No longer automatically show form if no invitations, user clicks button now
      // if (result.invitations.length === 0) {
      //   setShowCreateForm(true);
      // }

    } catch (err) {
      setFetchError(err.message);
    } finally {
      setIsFetchingInvitations(false);
    }
  };

  const handleUploadClick = () => {
    navigate('/upload-media');
  };

  const handleGalleryClick = () => {
    navigate('/event-gallery');
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(file.type)) {
        alert('Please upload a PNG or JPG image.');
        return;
      }

      if (file.size > maxSize) {
        alert('File size exceeds 5MB.');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!eventName || !location || !invitedBy || !selectedFile) {
      setError('Please fill in all required fields and upload an image.');
      setIsLoading(false);
      return;
    }

    const userEmail = localStorage.getItem('userEmail'); // Get user email from localStorage
    if (!userEmail) {
      setError('User email not found. Please log in again.');
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('eventName', eventName);
    formData.append('location', location);
    formData.append('invitedBy', invitedBy);
    formData.append('eventPrivacy', eventPrivacy);
    formData.append('invitationImage', selectedFile);
    formData.append('createdByEmail', userEmail); // Append user email

    try {
      const accessToken = localStorage.getItem('accessToken'); // Get access token
      const headers = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      const response = await fetch('http://localhost:5000/invitations/create', {
        method: 'POST',
        body: formData,
        headers: headers, // Add headers to the request
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create invitation.');
      }

      const result = await response.json();
      // After successful creation, refetch the list of invitations
      await fetchUserInvitations(); 
      // After successful creation, reset form fields and hide the form
      setEventName('');
      setLocation('');
      setInvitedBy('');
      setSelectedFile(null);
      setPreviewUrl('');
      setShowCreateForm(false); // Hide the form after successful submission
      navigate('/invitation-display', { state: { invitation: result.invitation } }); // Navigate to display page
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvitationCardClick = (invitation) => {
    navigate('/invitation-display', { state: { invitation } });
  };

  return (
    <div className="invitation-form-container">
      {showCreateForm ? (
        <div className="create-invite-card"> {/* New wrapper card */}
          <div className="header-card">
            <h2>Create Invitation</h2>
            <p>Design your perfect event invitation</p>
          </div>

          <div className="event-buttons-container">
            <button onClick={handleGalleryClick}>event gallery</button>
            <button onClick={handleUploadClick}>event uplode media</button>
          </div>

          <form onSubmit={handleSubmit}> {/* Wrap content in form and add onSubmit */}
            <div className="form-section">
              <label htmlFor="eventName">Event Name</label>
              <input
                type="text"
                id="eventName"
                placeholder="Enter event name"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </div>

            <div className="form-section">
              <label htmlFor="location">Address / Location</label>
              <input
                type="text"
                id="location"
                placeholder="Enter event location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-section">
              <label>Upload Invitation Card</label>
              <div className="upload-card-area" onClick={() => fileInputRef.current.click()}>
                {previewUrl ? (
                  <img src={previewUrl} alt="Invitation Preview" className="image-preview" />
                ) : (
                  <>
                    <img src="https://img.icons8.com/ios/50/000000/camera--v1.png" alt="Camera icon" />
                    <p>Click to upload or drag & drop</p>
                    <p>PNG, JPG up to 5MB</p>
                  </>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".png,.jpg,.jpeg"
                onChange={handleFileChange}
              />
            </div>

            <div className="form-section">
              <label htmlFor="invitedBy">Invited By</label>
              <input
                type="text"
                id="invitedBy"
                placeholder="Your name"
                value={invitedBy}
                onChange={(e) => setInvitedBy(e.target.value)}
              />
            </div>

            <div className="form-section">
              <label>Event Privacy</label>
              <div className="privacy-options">
                <button
                  type="button" // Prevent form submission on click
                  className={`privacy-button ${eventPrivacy === 'private' ? 'active' : ''}`}
                  onClick={() => setEventPrivacy('private')}
                >
                  <img src="https://img.icons8.com/ios-filled/24/000000/lock.png" alt="Lock icon" />
                  Private
                </button>
                <button
                  type="button" // Prevent form submission on click
                  className={`privacy-button ${eventPrivacy === 'public' ? 'active' : ''}`}
                  onClick={() => setEventPrivacy('public')}
                >
                  <img src="https://img.icons8.com/ios-filled/24/000000/globe--v1.png" alt="Globe icon" />
                  Public
                </button>
              </div>
            </div>

            <div className="preview-card">
              <h3>Preview</h3>
              <h4>{eventName || 'Event Name'}</h4>
              <p className="location-preview">
                📍 {location || 'Location'}
              </p>
              <p className="host-preview">Hosted by: {invitedBy || 'Host Name'}</p>
              <p className="privacy-preview">
                {eventPrivacy === 'private' ? '🔒 Private' : '🌍 Public'}
              </p>
            </div>

            {error && <p className="error-message" style={{ color: 'red' }}>{error}</p>}

            <button type="submit" className="send-invitations-button" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send Invitations'} <img src="https://img.icons8.com/emoji/24/000000/rocket-emoji.png" alt="Rocket emoji" />
            </button>
          </form>
        </div>
      ) : (
        <div className="user-invitations-section"> {/* This section is always visible */}
          <h2>Your Created Invitations</h2>
          {isFetchingInvitations ? (
            <p>Loading your invitations...</p>
          ) : fetchError ? (
            <p style={{ color: 'red' }}>Error: {fetchError}</p>
          ) : userInvitations.length > 0 ? (
            <div className="card-container">
              {userInvitations.map((invitation) => (
                <div className="card" key={invitation._id} onClick={() => handleInvitationCardClick(invitation)} style={{ cursor: 'pointer' }}>
                  {invitation.invitationImage && (
                    <img src={invitation.invitationImage.url} alt="Invitation Card" className="event-card-image" />
                  )}
                  <div className="event-details">
                    <p className="event-date">{invitation.eventName}</p>
                    <p className="event-name">{invitation.location}</p>
                    <p className="event-price">Hosted by: {invitation.invitedBy}</p>
                    <p className="event-privacy">{invitation.eventPrivacy === 'private' ? '🔒 Private' : '🌍 Public'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p>You haven't created any invitations yet.</p>
          )}
          <button className="send-invitations-button" onClick={() => setShowCreateForm(true)}>Create New Invitation</button> {/* Button to show create form */}
        </div>
      )}
    </div>
  );
}

export default InvitationForm;
