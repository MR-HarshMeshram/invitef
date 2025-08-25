import React, { useEffect, useState } from 'react';
import './Profile.css';
import LogoutButton from './component/LogoutButton';

function Profile() {
  const [isDarkMode, setIsDarkMode] = useState(false); // New state for dark mode
  const [userData, setUserData] = useState({
    fullName: 'Loading...',
    email: 'Loading...',
    phone: 'Loading...',
    location: 'Loading...',
    memberSince: 'Loading...',
    profilePicture: '',
  });

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const userEmail = localStorage.getItem('userEmail');
      const accessToken = localStorage.getItem('accessToken');

      if (!userEmail || !accessToken) {
        console.log('User not logged in or token missing.');
        // Optionally redirect to login or show a message
        return;
      }

      try {
        const response = await fetch(`https://invite-backend-vk36.onrender.com/auth/me`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user data.');
        }

        const data = await response.json();
        const fetchedUser = data.user; // Assuming the backend returns { user: {...} }

        setUserData({
          fullName: fetchedUser.name || 'N/A',
          email: fetchedUser.email || 'N/A',
          phone: fetchedUser.phone || 'N/A', // Assuming a 'phone' field from backend
          location: fetchedUser.location || 'N/A', // Assuming a 'location' field from backend
          memberSince: fetchedUser.createdAt ? new Date(fetchedUser.createdAt).toLocaleDateString() : 'N/A',
          profilePicture: fetchedUser.picture || '', // Assuming a 'picture' field from backend
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        // Handle error, e.g., display error message
      }
    };

    fetchUserData();
  }, []); // Empty dependency array means this effect runs once on mount

  return (
    <div className={`profile-container ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="profile-header-card">
        <div className="profile-avatar">{userData.fullName.charAt(0)}</div>
        <h3>{userData.fullName}</h3>
        <p>@{userData.email.split('@')[0]}</p>
      </div>

      <button onClick={toggleDarkMode} className="dark-mode-toggle-button">
        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
      </button>

      <LogoutButton />
      <div className="stats-grid">
        <div className="stat-card">
          <h4>24</h4>
          <p>EVENTS CREATED</p>
        </div>
        <div className="stat-card">
          <h4>156</h4>
          <p>INVITATIONS SENT</p>
        </div>

      </div>

      <div className="info-card">
        <h3>Personal Information</h3>
        <div className="info-item">
          <span>Full Name</span>
          <span>{userData.fullName}</span>
        </div>
        <div className="info-item">
          <span>Email</span>
          <span>{userData.email}</span>
        </div>
        <div className="info-item">
          <span>Phone</span>
          <span>{userData.phone}</span>
        </div>
        <div className="info-item">
          <span>Location</span>
          <span>{userData.location}</span>
        </div>
        <div className="info-item">
          <span>Member Since</span>
          <span>{userData.memberSince}</span>
        </div>
      </div>

      <div className="info-card">
        <h3>Account Settings</h3>
        <div className="info-item">
          <span>Email Notifications</span>
          <span>Enabled</span>
        </div>
        <div className="info-item">
          <span>Privacy</span>
          <span>Public Profile</span>
        </div>
        <div className="info-item">
          <span>Two-Factor Auth</span>
          <span>Enabled</span>
        </div>
      </div>

      <div className="profile-buttons">
        <button className="profile-button primary">EDIT PROFILE</button>

      </div>
    </div>
  );
}

export default Profile;
