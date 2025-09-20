import React from 'react';
import './LoginModal.css'; // You'll need to create this CSS file

const LoginModal = ({ onLoginSuccess, onClose }) => {
  const handleGoogleLogin = () => {
    // Redirect to your backend's Google OAuth initiation endpoint
    // Make sure this matches your backend route for Google login
    window.location.href = 'https://invite-backend-vk36.onrender.com/auth/google';
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Login to View Invitation</h2>
        <p>Please log in to accept or decline this invitation.</p>
        <button onClick={handleGoogleLogin} className="google-login-button">
          <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google icon" />
          Continue with Google
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
