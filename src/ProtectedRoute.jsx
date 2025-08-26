import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true); // New state to manage initial auth check

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsAuthenticated(true);
    } else {
      setShowLoginPopup(true);
    }
    setCheckingAuth(false); // Authentication check is complete
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setShowLoginPopup(false);
  };

  const handleCloseLogin = () => {
    setShowLoginPopup(false);
    navigate('/'); // Redirect to login page if user closes the modal without logging in
  };

  if (checkingAuth) {
    return <div>Loading authentication...</div>; // Or a spinner
  }

  if (!isAuthenticated) {
    return (
      <>
        {showLoginPopup && (
          <LoginModal onLoginSuccess={handleLoginSuccess} onClose={handleCloseLogin} />
        )}
        {/* You could also render a message here indicating the need to log in */}
      </>
    );
  }

  return children;
};

export default ProtectedRoute;
