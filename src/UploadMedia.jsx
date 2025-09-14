import React, { useState } from 'react';
import './UploadMedia.css';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

function UploadMedia() {
  const location = useLocation();
  const navigate = useNavigate();
  const { invitationId } = useParams(); // Get invitationId from URL parameters
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (event) => {
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

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image to upload.');
      return;
    }

    setIsLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('media', selectedFile);
    // The backend endpoint typically expects invitationId in the URL path for media upload
    // formData.append('invitationId', invitationId);

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        setError('Authentication token missing. Please log in again.');
        setIsLoading(false);
        return;
      }

      // Assuming the API endpoint for uploading media to a specific invitation is structured like this:
      const uploadUrl = `https://invite-backend-vk36.onrender.com/invitations/media/${invitationId}`;

      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload media.');
      }

      alert('Media uploaded successfully!');
      setSelectedFile(null); // Clear selected file after upload
      setPreviewUrl(''); // Clear image preview
      navigate(`/invitation/${invitationId}`); // Navigate back to the invitation gallery page
    } catch (err) {
      console.error('Error uploading media:', err);
      setError(`Upload failed: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="upload-media-container">
      <header className="upload-header">
        <button className="back-button" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="header-title">Upload Event Image</h1>
      </header>

      <main className="upload-content">
        <div className="upload-area">
          {!previewUrl ? (
            <label htmlFor="file-upload" className="upload-label">
              <span className="material-symbols-outlined upload-icon">cloud_upload</span>
              <p className="drag-drop-text">Drag and drop or browse</p>
              <p className="upload-description">Upload a photo for your event gallery.</p>
              <button type="button" className="browse-button">Browse</button>
            </label>
          ) : (
            <div className="image-preview-container">
              <img src={previewUrl} alt="Image Preview" className="image-preview" />
              <button type="button" className="remove-image-button" onClick={() => { setSelectedFile(null); setPreviewUrl(''); setError(null); }}>&times;</button>
            </div>
          )}
          <input
            id="file-upload"
            type="file"
            style={{ display: 'none' }}
            accept=".png,.jpg,.jpeg"
            onChange={handleFileChange}
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="button" className="upload-button" onClick={handleUpload} disabled={isLoading}>
          {isLoading ? 'Uploading...' : 'Upload Image'}
        </button>
      </main>
    </div>
  );
}

export default UploadMedia;
