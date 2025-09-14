import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './InvitationForm.css';
import { useLocation } from 'react-router-dom';

function InvitationForm() {
  const [eventName, setEventName] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [invitedBy, setInvitedBy] = useState('');
  const [eventPrivacy, setEventPrivacy] = useState('private');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [currentInvitationId, setCurrentInvitationId] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const locationHook = useLocation();

  // Check for navigation state on initial load
  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      navigate('/'); // Redirect to login if not authenticated
      return;
    }

    const params = new URLSearchParams(locationHook.search);
    const invitationIdParam = params.get('invitationId'); // Check for invitationId in query params
    const pathInvitationId = locationHook.pathname.split('/').pop(); // Get ID from path if editing

    const idToFetch = pathInvitationId !== 'create-invitation' && pathInvitationId !== 'invitation' ? pathInvitationId : invitationIdParam;

    if (idToFetch && locationHook.pathname.startsWith('/edit-invitation/')) {
      const fetchInvitationForEdit = async () => {
        setIsLoading(true); // Changed from setLoading to setIsLoading
        try {
          const response = await fetch(`https://invite-backend-vk36.onrender.com/invitations/${idToFetch}`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to fetch invitation for editing.');
          }
          const data = await response.json();
          setEventName(data.eventName);
          setLocation(data.location);
          setDescription(data.description || '');
          setDateTime(data.dateTime ? new Date(data.dateTime).toISOString().slice(0, 16) : '');
          setInvitedBy(data.invitedBy);
          setEventPrivacy(data.eventPrivacy);
          setPreviewUrl(data.invitationImage?.url || ''); // Pre-fill image preview
          setSelectedFile(null);
          setShowCreateForm(true);
          setIsEditing(true);
          setCurrentInvitationId(data._id);
        } catch (err) {
          setError(err.message);
          alert(`Error loading invitation for edit: ${err.message}`);
          navigate('/home'); // Redirect on error
        } finally {
          setIsLoading(false); // Changed from setLoading to setIsLoading
        }
      };
      fetchInvitationForEdit();
    } else {
      // Default behavior if not creating or editing, maybe redirect to home or list of user invitations if that page exists
      navigate('/home'); // Or a dedicated page to list user's invitations
    }
    // Clear state after handling to prevent stale data on back/forward navigation
    navigate(locationHook.pathname, { replace: true, state: {} });
  }, [locationHook.state, locationHook.pathname, locationHook.search, navigate, invitedBy]);

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
    formData.append('invitedBy', invitedBy || userEmail); // Use userEmail if invitedBy is not set
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

  return (
    <div className="create-invitation-page">
      <header className="header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="header-title">Create Invitation</h1>
      </header>

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
              {/* <label htmlFor="eventName">Event Title</label> */}
              <input
                type="text"
                id="eventName"
                placeholder="Event Title"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
            </div>

            <div className="form-field-group date-time-inputs">
              {/* <label htmlFor="dateTime">Date</label> */}
              <input
                type="date"
                id="date"
                value={dateTime ? dateTime.split('T')[0] : ''}
                onChange={(e) => setDateTime(`${e.target.value}T${dateTime ? dateTime.split('T')[1] : '00:00'}`)}
              />
              {/* <label htmlFor="dateTime">Time</label> */}
              <input
                type="time"
                id="time"
                value={dateTime ? dateTime.split('T')[1] : ''}
                onChange={(e) => setDateTime(`${dateTime ? dateTime.split('T')[0] : ''}T${e.target.value}`)}
              />
            </div>

            <div className="form-field-group">
              {/* <label htmlFor="location">Location</label> */}
              <input
                type="text"
                id="location"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="form-field-group">
              {/* <label htmlFor="description">Additional Details</label> */}
              <textarea
                id="description"
                placeholder="Additional Details"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
            </div>

            {/* Assuming invitedBy is removed or handled elsewhere based on new design */}
            {/* <div className="form-field-group">
              <label htmlFor="invitedBy">Invited By</label>
              <input
                type="text"
                id="invitedBy"
                placeholder="Your name"
                value={invitedBy}
                onChange={(e) => setInvitedBy(e.target.value)}
              />
            </div> */}
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
              {/* This will be a mock-up based on the screenshot, not dynamic content */}
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
        </form> {/* Closing form tag */}
      </div>
    </div>
  );
}

export default InvitationForm;
