import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import LoginPage from './LoginPage'; // Import the new LoginPage component
import Home from './Home';
import InvitationForm from './InvitationForm';
import Invited from './Invited';
import UploadMedia from './UploadMedia';
import EventGallery from './EventGallery';
import InvitationDisplay from './InvitationDisplay'; // Import InvitationDisplay
import Profile from './Profile';
import Header from './Header';
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
  const isLoginPage = location.pathname === '/';

  return (
    <>
      {!isLoginPage && <Header />} 
      <Routes>
        <Route path="/" element={<LoginPage />} /> {/* Use LoginPage component for the root route */}
        <Route path="/home" element={<Home />} />
        <Route path="/invitation" element={<InvitationForm />} />
        <Route path="/invitation-display" element={<InvitationDisplay />} /> {/* New route for displaying invitation */}
        <Route path="/invited" element={<Invited />} />
        <Route path="/upload-media" element={<UploadMedia />} />
        <Route path="/event-gallery" element={<EventGallery />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </>
  );
}

export default AppWrapper;
