import React from 'react';
import './LoginModal.css'; // You'll need to create this CSS file

const LoginModal = ({ onLoginSuccess, onClose }) => {
  const handleGoogleLogin = () => {
    // Redirect to your backend's Google OAuth initiation endpoint
    // This URL should be the same as your login page's Google login button
    window.location.href = `https://invite-backend-vk36.onrender.com/auth/google`;
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="login-modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Please Log In</h2>
        <p>To view this invitation, you need to be logged in.</p>
        <button className="google-login-button" onClick={handleGoogleLogin}>
          <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google icon" />
          Continue with Google
        </button>
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default LoginModal;
