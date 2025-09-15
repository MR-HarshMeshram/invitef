import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import LoginPage from './LoginPage'; // Import the new LoginPage component
import Home from './Home';
import InvitationForm from './InvitationForm';
import Invited from './Invited';
import InvitationGalleryPage from './InvitationGalleryPage'; // Import the new combined component
import Profile from './Profile';
import Dashboard from './Dashboard'; // Import the new Dashboard component
import MyInvitations from './MyInvitations'; // Import the new MyInvitations component
import Header from './Header';
import { useEffect } from 'react'; // Import useEffect
import './App.css';
import ProtectedRoute from './ProtectedRoute'; // Import the new ProtectedRoute component

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
        <Route path="/edit-invitation/:invitationId" element={<InvitationForm />} /> {/* New route for editing an invitation */}
        <Route path="/invited" element={<ProtectedRoute><Invited /></ProtectedRoute>} />
        <Route path="/my-invitations" element={<ProtectedRoute><MyInvitations /></ProtectedRoute>} /> {/* New route for MyInvitations */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/dashboard/:date" element={<Dashboard />} /> {/* New route for Dashboard */}
      </Routes>
    </>
  );
}

export default AppWrapper;
