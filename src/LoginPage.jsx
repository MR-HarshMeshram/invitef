import React from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Import the new CSS file

function LoginPage() {
  const navigate = useNavigate();

  const handleContinue = () => {
    navigate('/home');
  };

  return (
    <div className="app-container">
      <p className="event-text">
        CREATE YOUR INVITATION AND LET YOUR FRIENDS
        <br />
        JOIN THE EVENT
      </p>
      <button className="auth-button" onClick={() => window.location.href = `${import.meta.env.VITE_BACKEND_URL}/auth/google`}>
        <img src="https://img.icons8.com/color/16/000000/google-logo.png" alt="Google logo" />
        <span>Continue with Google</span>
      </button>
      {/* <button className="auth-button">
        <img src="https://img.icons8.com/ios-filled/16/000000/mail.png" alt="Email icon" />
        <span>Continue with Email</span>
      </button>
      <p className="or-text">OR</p> */}
      {/* <div className="mobile-input-container">
        <img src="https://img.icons8.com/color/16/000000/india-flag.png" alt="India flag"/>
        <span className="mobile-input-prefix">+91</span>
        <input
          type="tel"
          placeholder="Mobile number"
          className="mobile-input"
        />
      </div> */}
      {/* <button className="continue-button" onClick={handleContinue}>
        Continue
      </button> */}
    </div>
  );
}

export default LoginPage;
