import React, { useState } from 'react';
import './LoginModal.css'; // You'll need to create this CSS file

const LoginModal = ({ onLoginSuccess, onClose }) => {
  const handleGoogleLogin = () => {
    // This will redirect the user to Google login, and then Google will redirect back
    // to a route in your app that handles the token. onLoginSuccess will be called
    // by InvitationDisplay's useEffect when localStorage.getItem('userEmail') is updated.
    window.location.href = `https://invite-backend-vk36.onrender.com/auth/google`;
  };

  return (
    <div className="login-modal-overlay">
      <div className="login-modal-content">
        <button className="login-modal-close-button" onClick={onClose}>&times;</button>
        <h2>Login to View Invitation</h2>
        <button className="auth-button" onClick={handleGoogleLogin}>
          <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google logo" />
          <span>Continue with Google</span>
        </button>
        {/* Add other login options if needed, similar to LoginPage.jsx */}
      </div>
    </div>
  );
};

export default LoginModal;
