import React from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import LoginPage from './LoginPage'; // Import the new LoginPage component
import Home from './Home';
import InvitationForm from './InvitationForm';
import Invited from './Invited';
import UploadMedia from './UploadMedia';
import EventGallery from './EventGallery';
import InvitationDisplay from './InvitationDisplay'; // Import InvitationDisplay
import Profile from './Profile';
import Header from './Header';
import ProtectedRoute from './ProtectedRoute'; // Import ProtectedRoute
import { useEffect } from 'react'; // Import useEffect
import './App.css';

function AppWrapper() {
  return (
    <BrowserRouter basename="/">
      <MainContent />
    </BrowserRouter>
  );
}

function MainContent() {
  const location = useLocation();
  const navigate = useNavigate(); // Get the navigate hook
  const isLoginPage = location.pathname === '/';

  // Effect to handle redirection after Google login
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const name = params.get('name');
    const email = params.get('email');
    const picture = params.get('picture');

    if (token && email) { // Ensure both token and email are present
      localStorage.setItem('accessToken', token);
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userPicture', picture);

      // Check for a pending invitation path that triggered the login
      const pendingInvitationPath = localStorage.getItem('pendingInvitationPath');
      if (pendingInvitationPath) {
        localStorage.removeItem('pendingInvitationPath'); // Clear it after use
        window.location.href = pendingInvitationPath; // Force a full page reload
      } else {
        window.location.href = '/home'; // Force a full page reload
      }
    }
  }, [location.search]); // Removed navigate from dependencies as it's no longer used for these redirects

  return (
    <>
      {!isLoginPage && <Header />} 
      <Routes>
        <Route path="/" element={<LoginPage />} /> {/* Use LoginPage component for the root route */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/invitation" element={<ProtectedRoute><InvitationForm /></ProtectedRoute>} />
        <Route path="/invitation/:invitationId" element={<ProtectedRoute><InvitationDisplay /></ProtectedRoute>} /> {/* New dynamic route for displaying invitation by ID */}
        <Route path="/invitation-display" element={<ProtectedRoute><InvitationDisplay /></ProtectedRoute>} /> {/* New route for displaying invitation */}
        <Route path="/invited" element={<ProtectedRoute><Invited /></ProtectedRoute>} />
        <Route path="/upload-media" element={<ProtectedRoute><UploadMedia /></ProtectedRoute>} />
        <Route path="/event-gallery" element={<ProtectedRoute><EventGallery /></ProtectedRoute>} />
        <Route path="/event-gallery/:invitationId" element={<ProtectedRoute><EventGallery /></ProtectedRoute>} /> {/* Dynamic route for EventGallery */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default AppWrapper;
