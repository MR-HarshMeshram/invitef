import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [allInvitations, setAllInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');
    const name = params.get('name');
    const email = params.get('email');
    const picture = params.get('picture');

    if (token) {
      localStorage.setItem('accessToken', token);
      localStorage.setItem('userName', name);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('userPicture', picture);
      // Optionally, remove query parameters from the URL
      const pendingInvitationId = localStorage.getItem('pendingInvitationId');
      if (pendingInvitationId) {
        localStorage.removeItem('pendingInvitationId'); // Clear it after use
        navigate(`/invitation/${pendingInvitationId}`, { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    }

    const fetchAllInvitations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`https://invite-backend-vk36.onrender.com/invitations/all`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch all invitations.');
        }
        const result = await response.json();
        const sortedInvitations = result.invitations.sort((a, b) => {
          const dateA = new Date(a.dateTime);
          const dateB = new Date(b.dateTime);
          return dateB - dateA; // Sort in descending order (latest first)
        });
        setAllInvitations(sortedInvitations);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllInvitations();
  }, [location, navigate]);

  const handleCreateInvitationClick = () => {
    navigate('/invitation', { state: { showForm: true } });
  };

  const handleInvitationCardClick = (invitation) => {
    navigate(`/invitation/${invitation._id}`); // Pass invitation ID as a URL parameter
  };

  return (
    <div className="home-container">
      <header className="header">
        <button className="header-button" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="header-title">Public Events</h1>
      </header>

      <main>
        <div className="invitation-banner">
          <h2>Design Your Perfect Invitation</h2>
          <p>Create beautiful and personalized cards for any occasion.</p>
          <button className="create-invite-button" onClick={handleCreateInvitationClick}>
            Create Invite
          </button>
        </div>

        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Upcoming Events</h2>
            <a className="see-all-link" href="#">See all</a>
          </div>
          <div className="events-scroll-container">
            {isLoading ? (
              <p>Loading invitations...</p>
            ) : error ? (
              <p style={{ color: 'red' }}>Error: {error}</p>
            ) : allInvitations.length > 0 ? (
              allInvitations.map((invitation) => (
                <div className="event-card" key={invitation._id} onClick={() => handleInvitationCardClick(invitation)}>
                  {invitation.invitationImage && (
                    <img src={invitation.invitationImage.url} alt="Invitation Card" className="event-card-image" />
                  )}
                  <div className="event-card-content">
                    {invitation.eventName && <p className="event-card-title">{invitation.eventName}</p>}
                    {invitation.dateTime && <p className="event-card-date">{new Date(invitation.dateTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>}
                    <button className="view-details-button">View Details</button>
                  </div>
                </div>
              ))
            ) : (
              <p>No upcoming events available yet.</p>
            )}
          </div>
        </div>

        <div className="section">
          <div className="section-header">
            <h2 className="section-title">Featured Events</h2>
          </div>
          <div className="events-scroll-container">
            {isLoading ? (
              <p>Loading featured events...</p>
            ) : error ? (
              <p style={{ color: 'red' }}>Error: {error}</p>
            ) : allInvitations.length > 0 ? (
              allInvitations.map((invitation) => (
                <div className="featured-event-card" key={invitation._id} onClick={() => handleInvitationCardClick(invitation)}>
                  {invitation.invitationImage && (
                    <img src={invitation.invitationImage.url} alt="Featured Event" className="featured-event-image" />
                  )}
                  <div>
                    {invitation.eventName && <p className="featured-event-title">{invitation.eventName}</p>}
                    {invitation.description && <p className="featured-event-description">{invitation.description}</p>}
                  </div>
                </div>
              ))
            ) : (
              <p>No featured events available yet.</p>
            )}
          </div>
        </div>
      </main>

      <nav className="navbar">
        <a className="nav-item" href="#">
          <span className="material-symbols-outlined nav-item-icon">home</span>
          <span>Home</span>
        </a>
        <a className="nav-item" href="#">
          <span className="material-symbols-outlined nav-item-icon">mail</span>
          <span>Invited</span>
        </a>
        <a className="nav-item" href="/my-invitations">
          <span className="material-symbols-outlined nav-item-icon">recent_invitations</span>
          <span>My Invitations</span>
        </a>
        <a className="nav-item" href="#" onClick={handleCreateInvitationClick}>
          <span className="material-symbols-outlined nav-item-icon">add_circle</span>
          <span>Invite</span>
        </a>
        <a className="nav-item" href="#">
          <span className="material-symbols-outlined nav-item-icon">person</span>
          <span>Profile</span>
        </a>
      </nav>
    </div>
  );
}

export default Home;
