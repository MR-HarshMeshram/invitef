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
    <div className="create-invitation-page">
      <header className="header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="header-title">Create Invitation</h1>
      </header>

      {showCreateForm ? (
        <div className="section-container">
          <form onSubmit={handleSubmit}> {/* Moved form tag here to wrap all form elements and the submit button */}
            <section className="upload-photo-section">
              <h2 className="section-heading">Upload Photo</h2>
              <div className="upload-area" onClick={() => fileInputRef.current.click()}>
                {previewUrl ? (
                  <div className="image-preview-container">
                    <img src={previewUrl} alt="Invitation Preview" className="image-preview" />
                  </div>
                ) : (
                  <>
                    <span className="material-symbols-outlined upload-icon">cloud_upload</span>
                    <p className="upload-text-main">Drag and drop or browse</p>
                    <p className="upload-text-sub">Upload a photo to personalize your invitation card.</p>
                    <button type="button" className="browse-button">Browse</button>
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
            </section>

            <section className="customize-text-section">
              <h2 className="section-heading">Customize Text</h2>
              <div className="form-field-group">
                <input
                  type="text"
                  id="eventName"
                  placeholder="Event Title"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                />
              </div>

              <div className="form-field-group date-time-inputs">
                <input
                  type="date"
                  id="date"
                  value={dateTime ? dateTime.split('T')[0] : ''}
                  onChange={(e) => setDateTime(`${e.target.value}T${dateTime ? dateTime.split('T')[1] : '00:00'}`)}
                />
                <input
                  type="time"
                  id="time"
                  value={dateTime ? dateTime.split('T')[1] : ''}
                  onChange={(e) => setDateTime(`${dateTime ? dateTime.split('T')[0] : ''}T${e.target.value}`)}
                />
              </div>

              <div className="form-field-group">
                <input
                  type="text"
                  id="location"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="form-field-group">
                <textarea
                  id="description"
                  placeholder="Additional Details"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
            </section>

            <section className="invite-visibility-section">
              <h2 className="section-heading">Invite Visibility</h2>
              <div className="privacy-options">
                <div className={`privacy-card ${eventPrivacy === 'private' ? 'active' : ''}`} onClick={() => setEventPrivacy('private')}>
                  <div className={`privacy-radio ${eventPrivacy === 'private' ? 'active' : ''}`}></div>
                  <div className="privacy-text">
                    <h4>Private Invite</h4>
                    <p>Only people you invite can see this.</p>
                  </div>
                </div>
                <div className={`privacy-card ${eventPrivacy === 'public' ? 'active' : ''}`} onClick={() => setEventPrivacy('public')}>
                  <div className={`privacy-radio ${eventPrivacy === 'public' ? 'active' : ''}`}></div>
                  <div className="privacy-text">
                    <h4>Public Invite</h4>
                    <p>Anyone with the link can see this.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="preview-section">
              <h2 className="section-heading">Preview</h2>
              <div className="preview-content">
                <img src="/images/invitation-mock.png" alt="Invitation Mockup" className="preview-invitation-image-mock" />
                <div className="preview-invitation-details">
                  <h3>You're Invited!</h3>
                  <p>Join us for a {eventName || 'birthday celebration'}</p>
                  <p>{dateTime ? new Date(dateTime).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Sat, Dec 25, 2024 at 7:00 PM'}</p>
                  <p>{location || '123 Party Lane, Fun City'}</p>
                </div>
              </div>
            </section>

            {error && <p className="error-message">{error}</p>}

            <button type="submit" className="create-invitation-submit-button" disabled={isLoading}>
              {isLoading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Invitation')}
            </button>
          </form>
        </div>
      ) : (
        <div className="user-invitations-section"> {/* This section is always visible */}
          <h2>Your Created Invitations</h2>
          {isFetchingInvitations ? (
            <p className="no-invitations-message">Loading your invitations...</p>
          ) : fetchError ? (
            <p className="no-invitations-message" style={{ color: 'red' }}>No invitation created yet.</p>
          ) : userInvitations.length > 0 ? (
            <div className="card-grid">
              {userInvitations.map((invitation) => (
                <div className="invitation-card" key={invitation._id} onClick={() => handleInvitationCardClick(invitation)}>
                  {invitation.invitationImage && (
                    <img src={invitation.invitationImage.url} alt="Invitation Card" className="invitation-card-image" />
                  )}
                  <div className="invitation-card-content">
                    {invitation.eventName && <p className="invitation-card-title">{invitation.eventName}</p>}
                    {invitation.dateTime && <p className="invitation-card-date">{new Date(invitation.dateTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>}
                    <button className="view-details-btn">View Details</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-invitations-message">You haven't created any invitations yet.</p>
          )}
          <button className="create-new-invitation-fab" onClick={() => setShowCreateForm(true)}>
            <span className="material-symbols-outlined">add</span>
            Create New Invitation
          </button>
        </div>
      )}
    </div>
  );
}

export default InvitationForm;
