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
  const [isEditing, setIsEditing] = useState(false); // New state to track if we are editing an existing invitation
  const [currentInvitationId, setCurrentInvitationId] = useState(null); // New state to store the ID of the invitation being edited
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const locationHook = useLocation(); // Use useLocation hook

  // Check for navigation state on initial load
  useEffect(() => {
    if (locationHook.state) {
      if (locationHook.state.showForm) {
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
        setIsEditing(true); // Set editing mode to true
        setCurrentInvitationId(invitation._id); // Set the ID of the invitation being edited
        navigate(locationHook.pathname, { replace: true, state: {} }); // Clear state
      }
    }
  }, [locationHook.state, navigate]); // Add locationHook.state and navigate to dependencies

  // Function to fetch invitations
  const fetchUserInvitations = async () => {
    const userEmail = localStorage.getItem('userEmail');
    const accessToken = localStorage.getItem('accessToken');

    if (!userEmail || !accessToken) {
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

      // No longer automatically show form if no invitations, user clicks button now
      // if (result.invitations.length === 0) {
      //   setShowCreateForm(true);
      // }

        } catch (err) {
        } finally {
    }
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

    if (!isEditing && (!eventName || !location || !selectedFile)) {
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
    formData.append('description', description); // Append description
    formData.append('dateTime', dateTime); // Append dateTime
    formData.append('eventPrivacy', eventPrivacy);
    formData.append('invitedBy', userEmail); // Re-add invitedBy using userEmail
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
        <h1 className="header-title">Create Invitation</h1>
      </header>

      <main className="form-content">
        <div className="create-invitation-banner">
          <h2>Create Invitation</h2>
          <p>Design your perfect event invitation</p>
        </div>

        <form onSubmit={handleSubmit} className="invitation-form">
          <section className="upload-photo-section">
            <label className="upload-area" htmlFor="file-upload">
              <span className="material-symbols-outlined upload-icon">cloud_upload</span>
              <p className="drag-drop-text">Drag and drop or browse</p>
              <p className="upload-description">Upload a photo to personalize your invitation card.</p>
              <button type="button" className="browse-button" onClick={() => fileInputRef.current.click()}>Browse</button>
            </label>
            <input
              id="file-upload"
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept=".png,.jpg,.jpeg"
              onChange={handleFileChange}
            />
            {previewUrl && (
              <div className="image-preview-container">
                <img src={previewUrl} alt="Invitation Preview" className="image-preview" />
                <button type="button" className="remove-image-button" onClick={() => setPreviewUrl('')}>&times;</button>
              </div>
            )}
          </section>

          <section className="customize-text-section">
            <div className="form-field">
              <label htmlFor="eventName" className="text-align-left">Event Title</label>
              <input
                type="text"
                id="eventName"
                placeholder="Event title"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </div>

            <div className="form-field-group">
              <div className="form-field date-field">
                <input
                  type="date"
                  id="date"
                  value={dateTime ? dateTime.split('T')[0] : ''}
                  onChange={(e) => setDateTime(`${e.target.value}T${dateTime.split('T')[1] || '00:00'}`)}
                />
                <span className="material-symbols-outlined">calendar_month</span>
              </div>
              <div className="form-field time-field">
                <input
                  type="time"
                  id="time"
                  value={dateTime ? dateTime.split('T')[1] : ''}
                  onChange={(e) => setDateTime(`${dateTime.split('T')[0] || new Date().toISOString().slice(0,10)}T${e.target.value}`)}
                />
                <span className="material-symbols-outlined">schedule</span>
              </div>
            </div>

            <div className="form-field">
              <label htmlFor="location" className="text-align-left">Location</label>
              <input
                type="text"
                id="location"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-field">
              <label htmlFor="description" className="text-align-left">Additional Details</label>
              <textarea
                id="description"
                placeholder="Additional Details"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>
          </section>

          <section className="invite-visibility-section">
            <label className="section-label">Invite Visibility</label>
            <div className="visibility-options">
              <button
                type="button"
                className={`visibility-button ${eventPrivacy === 'private' ? 'active' : ''}`}
                onClick={() => setEventPrivacy('private')}
              >
                <span className="radio-icon material-symbols-outlined">
                  {eventPrivacy === 'private' ? 'radio_button_checked' : 'radio_button_unchecked'}
                </span>
                Private Invite
                <span className="description-text">Only people you invite can see this.</span>
              </button>
              <button
                type="button"
                className={`visibility-button ${eventPrivacy === 'public' ? 'active' : ''}`}
                onClick={() => setEventPrivacy('public')}
              >
                <span className="radio-icon material-symbols-outlined">
                  {eventPrivacy === 'public' ? 'radio_button_checked' : 'radio_button_unchecked'}
                </span>
                Public Invite
                <span className="description-text">Anyone with the link can see this.</span>
              </button>
            </div>
          </section>

          <section className="preview-section">
            <h3 className="section-label">Preview</h3>
            <div className="preview-card">
              <div className="preview-image-container">
                {previewUrl ? (
                  <img src={previewUrl} alt="Invitation Preview" className="preview-image" />
                ) : (
                  <div className="placeholder-image">Invitation</div>
                )}
              </div>
              <div className="preview-details">
                <p className="preview-event-name">You're Invited!</p>
                <p className="preview-description">{description || "Join us for a birthday celebration"}</p>
                <p className="preview-date-time">{dateTime ? new Date(dateTime).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : "Sat, Dec 25, 2024"} at {dateTime ? new Date(dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "7:00 PM"}</p>
                <p className="preview-location">{location || "123 Party Lane, Fun-City"}</p>
              </div>
            </div>
          </section>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="create-invitation-button" disabled={isLoading}>
            {isLoading ? (isEditing ? 'Saving...' : 'Creating...') : (isEditing ? 'Save Changes' : 'Create Invitation')}
          </button>
        </form>
      </main>
    </div>
  );
}

export default InvitationForm;
