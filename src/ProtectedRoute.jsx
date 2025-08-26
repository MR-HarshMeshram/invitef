import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const accessToken = localStorage.getItem('accessToken');
  const location = useLocation();

  if (!accessToken) {
    // User not logged in, save the current path and redirect to the login page
    localStorage.setItem('pendingInvitationPath', location.pathname);
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
