import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import LoginPage from './LoginPage'; // Import the new LoginPage component
import Home from './Home';
import InvitationForm from './InvitationForm';
import Invited from './Invited';
import UploadMedia from './UploadMedia';
import InvitationGalleryPage from './InvitationGalleryPage'; // Import the new combined component
import Profile from './Profile';
import Dashboard from './Dashboard'; // Import the new Dashboard component
import MyInvitations from './MyInvitations'; // Import the new MyInvitations component
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
        <Route path="/invitation/:invitationId" element={<InvitationGalleryPage />} /> {/* Use the new combined component here */}
        <Route path="/invited" element={<Invited />} />
        <Route path="/upload-media" element={<UploadMedia />} />
        <Route path="/my-invitations" element={<MyInvitations />} /> {/* New route for MyInvitations */}
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard/:date" element={<Dashboard />} /> {/* New route for Dashboard */}
      </Routes>
    </>
  );
}

export default AppWrapper;
