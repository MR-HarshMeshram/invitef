import React from 'react';
import './Profile.css';
import LogoutButton from './component/LogoutButton';

function Profile() {
  return (
    <div className="profile-container">
      <div className="profile-header-card">
        <div className="profile-avatar">JD</div>
        <h3>John Doe</h3>
        <p>@johndoe</p>
      </div>


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
          <span>John Doe</span>
        </div>
        <div className="info-item">
          <span>Email</span>
          <span>john.doe@email.com</span>
        </div>
        <div className="info-item">
          <span>Phone</span>
          <span>+1 (555) 123-4567</span>
        </div>
        <div className="info-item">
          <span>Location</span>
          <span>New York, NY</span>
        </div>
        <div className="info-item">
          <span>Member Since</span>
          <span>January 2024</span>
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

        <button className="profile-button danger">SIGN OUT</button>
      </div>
    </div>
  );
}

export default Profile;
