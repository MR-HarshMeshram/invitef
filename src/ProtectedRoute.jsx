import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const accessToken = localStorage.getItem('accessToken');

  if (!accessToken) {
    // User not logged in, redirect to the login page
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
