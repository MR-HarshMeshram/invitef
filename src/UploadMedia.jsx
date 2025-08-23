import React, { useState } from 'react';
import './UploadMedia.css';
import { useLocation } from 'react-router-dom';

function UploadMedia() {
  const location = useLocation();
  const { invitationId } = location.state || {}; // Get invitationId from location.state
  const [activeTab, setActiveTab] = useState('images');
  const [imagesCount, setImagesCount] = useState(0);
  const [videosCount, setVideosCount] = useState(0);
  const [storiesCount, setStoriesCount] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [imagePreviews, setImagePreviews] = useState([]); // Re-introduce state for image previews

  const handleFileChange = (event) => {
    const newFiles = Array.from(event.target.files);
    const currentFilesCount = selectedFiles.length;
    const filesToAdd = 3 - currentFilesCount; // How many more files can be added

    if (filesToAdd <= 0) {
      alert('You can only upload a maximum of 3 files.');
      return;
    }

    const filesForUpload = [...selectedFiles, ...newFiles.slice(0, filesToAdd)];
    setSelectedFiles(filesForUpload);

    // Generate image previews for all selected image files
    const newImagePreviews = filesForUpload
      .filter(file => file.type.startsWith('image/'))
      .map(file => URL.createObjectURL(file));

    // Revoke previous object URLs to prevent memory leaks for *removed* previews
    const prevUrls = imagePreviews;
    const currentUrls = newImagePreviews;
    prevUrls.filter(url => !currentUrls.includes(url)).forEach(url => URL.revokeObjectURL(url));
    
    setImagePreviews(newImagePreviews);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select files to upload.');
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('media', file);
    });
    formData.append('invitationId', invitationId);

    try {
      const accessToken = localStorage.getItem('accessToken');
      if (!accessToken) {
        alert('Authentication token missing. Please log in again.');
        return;
      }

      // Replace with your actual upload API endpoint
      const response = await fetch(`http://localhost:5000/invitations/media/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          // 'Content-Type': 'multipart/form-data', // Browser sets this automatically with FormData
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to upload media.');
      }

      alert('Media uploaded to Cloudinary and URI saved to MongoDB successfully!');
      setSelectedFiles([]); // Clear selected files after upload
      setImagePreviews([]); // Clear image previews as well
      // Optionally, refresh counts or navigate
    } catch (error) {
      console.error('Error uploading media:', error);
      alert(`Error: ${error.message}`);
    }
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    imagePreviews.forEach(url => URL.revokeObjectURL(url)); // Revoke object URLs
    setImagePreviews([]); // Clear image previews as well
  }

  const handleRemovePreview = (index) => {
    const newImagePreviews = imagePreviews.filter((_, i) => i !== index);
    setImagePreviews(newImagePreviews);
    // Revoke the object URL for the removed preview
    URL.revokeObjectURL(imagePreviews[index]);
  };

  return (
    <div className="upload-media-container">
      <div className="header">
        <div className="back-arrow"></div>
        <div className="title-section">
          <h3>Upload Event Media</h3>
          <p>Share your event moments with the world</p>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab-button ${activeTab === 'images' ? 'active' : ''}`} onClick={() => setActiveTab('images')}>
          <img src="https://img.icons8.com/ios-filled/24/ffffff/image.png" alt="Images icon" />
          Images
        </button>
        <button className={`tab-button ${activeTab === 'videos' ? 'active' : ''}`} onClick={() => setActiveTab('videos')}>
          <img src="https://img.icons8.com/ios-filled/24/ffffff/video.png" alt="Videos icon" />
          Videos
        </button>
        <button className={`tab-button ${activeTab === 'stories' ? 'active' : ''}`} onClick={() => setActiveTab('stories')}>
          <img src="https://img.icons8.com/ios-filled/24/ffffff/instagram-stories.png" alt="Stories icon" />
          Stories
        </button>
      </div>

      <div className="counts-section">
        <div className="count-item">
          <p className="count-number">{imagesCount}</p>
          <p className="count-label">Images</p>
        </div>
        <div className="count-item">
          <p className="count-number">{videosCount}</p>
          <p className="count-label">Videos</p>
        </div>
        <div className="count-item">
          <p className="count-number">{storiesCount}</p>
          <p className="count-label">Stories</p>
        </div>
      </div>

      <div className="upload-area">
        <img src="https://img.icons8.com/ios/80/000000/camera--v1.png" alt="Camera icon" />
        <h4>Upload Images</h4>
        <p>Drag & drop or click to browse</p>
        <p className="file-types">JPG, PNG, GIF up to 10MB each</p>
        <div className="file-input-wrapper">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden-file-input"
            id="file-upload"
            accept="image/*,video/*"
          />
          <label htmlFor="file-upload" className="choose-files-button">Choose Files</label>
          <div className="selected-file-names">
            {selectedFiles.length > 0 ? (
              selectedFiles.map((file, index) => (
                <span key={index} className="file-name">{file.name}{index < selectedFiles.length - 1 ? ', ' : ''}</span>
              ))
            ) : (
              <span>No files chosen</span>
            )}
          </div>
        </div>
      </div>

      {imagePreviews.length > 0 ? (
        <div className="image-previews">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="preview-item">
              <img src={preview} alt="Preview" className="preview-image" />
              <button className="remove-preview-button" onClick={() => handleRemovePreview(index)}>X</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="no-media-message">
          <img src="https://img.icons8.com/plasticine/100/000000/no-image.png" alt="No image uploaded" />
          <p>No images uploaded yet</p>
          <p>Share beautiful moments from your event.</p>
        </div>
      )}

      <div className="footer-buttons">
        <button className="clear-all-button" onClick={handleClearAll}>Clear All</button>
        <button className="publish-media-button" onClick={handleUpload}>Publish Media</button>
      </div>
    </div>
  );
}

export default UploadMedia;
