import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginModal from './LoginModal';

const ProtectedRoute = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      // User is not logged in, show login popup
      setShowLoginPopup(true);
      localStorage.setItem('pendingPath', location.pathname); // Store the intended path
    } else {
      // User is logged in, hide popup if it was shown and continue
      setShowLoginPopup(false);
    }
    setIsCheckingAuth(false);
  }, [location.pathname]);

  const handleLoginSuccess = () => {
    setShowLoginPopup(false);
    const pendingPath = localStorage.getItem('pendingPath');
    if (pendingPath) {
      localStorage.removeItem('pendingPath');
      navigate(pendingPath, { replace: true });
    } else {
      // Fallback if no pending path, navigate to home or default
      navigate('/home', { replace: true });
    }
  };

  if (isCheckingAuth) {
    return <div>Loading authentication...</div>; // Or a more elaborate spinner
  }

  if (showLoginPopup) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} onClose={() => setShowLoginPopup(false)} />; // Render LoginModal directly
  }

  return children; // If logged in, render the child components
};

export default ProtectedRoute;
