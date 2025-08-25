import React from "react";
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPicture');
    console.log("Logged out successfully");
    navigate('/'); // Redirect to login page
  };

  return (
    <button
      onClick={handleLogout}
      className="profile-button danger"
    >
      SIGN OUT
    </button>
  );
};

export default LogoutButton;
