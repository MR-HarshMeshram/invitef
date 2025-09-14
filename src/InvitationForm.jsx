import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './InvitationForm.css';
import { useLocation } from 'react-router-dom'; // Added useLocation import

function InvitationForm() {
  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState(''); // New state for description
  const [dateTime, setDateTime] = useState(''); // New state for date and time
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
  const [isEditing, setIsEditing] = useState(false); // New state to track if we are editing an existing invitation
  const [currentInvitationId, setCurrentInvitationId] = useState(null); // New state to store the ID of the invitation being edited
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const locationHook = useLocation(); // Use useLocation hook

  // Check for navigation state on initial load
  useEffect(() => {
    if (locationHook.state) {
      if (locationHook.state.showForm) {
        setShowCreateForm(true);
        setIsEditing(false); // Not editing when creating a new form
        setCurrentInvitationId(null);
        // Clear the state so it doesn't persist if the user navigates away and back
        navigate(locationHook.pathname, { replace: true, state: {} });
      } else if (locationHook.state.invitation && locationHook.state.isEditing) {
        const { invitation } = locationHook.state;
        setEventName(invitation.eventName);
        setLocation(invitation.location);
        setDescription(invitation.description || '');
        setDateTime(invitation.dateTime ? new Date(invitation.dateTime).toISOString().slice(0, 16) : '');
        setInvitedBy(invitation.invitedBy);
        setEventPrivacy(invitation.eventPrivacy);
        setPreviewUrl(invitation.invitationImage.url); // Pre-fill image preview
        setSelectedFile(null); // No file selected initially for edit, only URL
        setShowCreateForm(true); // Show the form for editing
        setIsEditing(true); // Set editing mode to true
        setCurrentInvitationId(invitation._id); // Set the ID of the invitation being edited
        navigate(locationHook.pathname, { replace: true, state: {} }); // Clear state
      }
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
      const response = await fetch(`https://invite-backend-vk36.onrender.com/invitations/user/${userEmail}`, {
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

    if (!isEditing && (!eventName || !location || !invitedBy || !selectedFile)) {
      setError('Please fill in all required fields and upload an image.');
      setIsLoading(false);
      return;
    }

    // When editing, if no new file is selected, ensure the existing image URL is maintained.
    // This is handled by not appending 'invitationImage' to formData if selectedFile is null.

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
    formData.append('description', description); // Append description
    formData.append('dateTime', dateTime); // Append dateTime
    formData.append('eventPrivacy', eventPrivacy);
    // Only append new image if selected
    if (selectedFile) {
      formData.append('invitationImage', selectedFile);
    }
    formData.append('createdByEmail', userEmail); // Append user email

    try {
      const accessToken = localStorage.getItem('accessToken'); // Get access token
      const headers = {};
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }

      let response;
      let url;
      let method;

      if (isEditing) {
        url = `https://invite-backend-vk36.onrender.com/invitations/${currentInvitationId}`;
        method = 'PUT';
        console.log('Sending PUT request to:', url);
        console.log('Headers:', headers);
        // For PUT requests with FormData, don't set Content-Type header manually
        // The browser will set it automatically with the correct boundary
        response = await fetch(url, {
          method: method,
          body: formData,
          headers: headers,
        });
      } else {
        url = 'https://invite-backend-vk36.onrender.com/invitations/create';
        method = 'POST';
        console.log('Sending POST request to:', url);
        console.log('Headers:', headers);
        response = await fetch(url, {
          method: method,
          body: formData,
          headers: headers,
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditing ? 'update' : 'create'} invitation.`);
      }

      const result = await response.json();
      // After successful creation/update, refetch the list of invitations
      await fetchUserInvitations();
      // After successful creation/update, reset form fields and hide the form
      setEventName('');
      setLocation('');
      setInvitedBy('');
      setDescription(''); // Reset description
      setDateTime(''); // Reset dateTime
      setSelectedFile(null);
      setPreviewUrl('');
      setShowCreateForm(false); // Hide the form after successful submission
      setIsEditing(false); // Reset editing state
      setCurrentInvitationId(null); // Clear current invitation ID
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
      <header className="form-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="form-title">Create Invitation</h1>
      </header>

      <main className="form-content">
        <section>
          <h2 className="section-heading">Upload Photo</h2>
          <div className="upload-photo-area" onClick={() => fileInputRef.current.click()}>
            {previewUrl ? (
              <img src={previewUrl} alt="Invitation Preview" className="image-preview" />
            ) : (
              <>
                <span className="material-symbols-outlined upload-icon">cloud_upload</span>
                <p className="upload-text-main">Drag and drop or browse</p>
                <p className="upload-text-sub">Upload a photo to personalize your invitation card.</p>
                <button type="button" className="browse-button">Browse</button>
              </>
            )}
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".png,.jpg,.jpeg"
              onChange={handleFileChange}
            />
          </div>
        </section>

        <section>
          <h2 className="section-heading">Customize Text</h2>
          <div className="form-group">
            <input
              type="text"
              id="eventName"
              placeholder="Event Title"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
            />
          </div>
          <div className="datetime-inputs">
            <div className="form-group">
              <input
                type="date"
                id="date"
                value={dateTime ? dateTime.split('T')[0] : ''}
                onChange={(e) => setDateTime(e.target.value + (dateTime ? `T${dateTime.split('T')[1]}` : 'T00:00'))}
              />
              <span className="material-symbols-outlined datetime-icon">calendar_today</span>
            </div>
            <div className="form-group">
              <input
                type="time"
                id="time"
                value={dateTime ? dateTime.split('T')[1] : ''}
                onChange={(e) => setDateTime((dateTime ? dateTime.split('T')[0] : '2024-01-01') + `T${e.target.value}`)}
              />
              <span className="material-symbols-outlined datetime-icon">schedule</span>
            </div>
          </div>
          <div className="form-group">
            <input
              type="text"
              id="location"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="form-group">
            <textarea
              id="description"
              placeholder="Additional Details"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>
        </section>

        <section>
          <h2 className="section-heading">Invite Visibility</h2>
          <div className="invite-visibility-options">
            <label className={`privacy-option-card ${eventPrivacy === 'private' ? 'active' : ''}`}>
              <input
                type="radio"
                name="eventPrivacy"
                value="private"
                checked={eventPrivacy === 'private'}
                onChange={() => setEventPrivacy('private')}
              />
              <div className="option-content">
                <p className="option-title">Private Invite</p>
                <p className="option-description">Only people you invite can see this.</p>
              </div>
            </label>
            <label className={`privacy-option-card ${eventPrivacy === 'public' ? 'active' : ''}`}>
              <input
                type="radio"
                name="eventPrivacy"
                value="public"
                checked={eventPrivacy === 'public'}
                onChange={() => setEventPrivacy('public')}
              />
              <div className="option-content">
                <p className="option-title">Public Invite</p>
                <p className="option-description">Anyone with the link can see this.</p>
              </div>
            </label>
          </div>
        </section>

        <section className="preview-section">
          <h2 className="preview-heading">Preview</h2>
          <div className="preview-card-display">
            {previewUrl ? (
              <img src={previewUrl} alt="Invitation Preview" className="preview-invitation-image" />
            ) : (
              <div className="no-image-placeholder">Invitation Preview</div>
            )}
          </div>
          <div className="preview-details">
            <h3>You're Invited!</h3>
            <p>Join us for a {eventName || 'event'} celebration</p>
            <p>{dateTime ? new Date(dateTime).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Date & Time'}</p>
            <p>{location || 'Location'}</p>
          </div>
        </section>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="create-invitation-submit-button" disabled={isLoading}>
          {isLoading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Invitation')}
        </button>
      </main>
    </div>
  );
}

export default InvitationForm;
