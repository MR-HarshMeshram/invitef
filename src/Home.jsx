import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Home.css';
import LoginModal from './LoginModal';

function Home() {
  const navigate = useNavigate();
  const location = useLocation();
  const [allInvitations, setAllInvitations] = useState([]);
  const [pastOrCurrentInvitations, setPastOrCurrentInvitations] = useState([]); // Renamed from filteredInvitations
  const [upcomingInvitations, setUpcomingInvitations] = useState([]); // New state for upcoming events
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState({}); // New state for expanded descriptions

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

  // Filter invitations based on date
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize today's date to the start of the day

    const upcoming = allInvitations.filter(invitation => {
      const invitationDate = new Date(invitation.dateTime);
      invitationDate.setHours(0, 0, 0, 0);
      return invitationDate > today;
    });
    setUpcomingInvitations(upcoming);

    const pastOrCurrent = allInvitations.filter(invitation => {
      const invitationDate = new Date(invitation.dateTime);
      invitationDate.setHours(0, 0, 0, 0);
      return invitationDate <= today;
    });
    setPastOrCurrentInvitations(pastOrCurrent);
  }, [allInvitations]);

  const handleCreateInvitationClick = () => {
    navigate('/invitation', { state: { showForm: true } });
  };

  const handleInvitationCardClick = (invitation) => {
    navigate(`/invitation/${invitation._id}`); // Pass invitation ID as a URL parameter
  };

  const handleCreateInviteClick = () => {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      setShowLoginPopup(true);
    } else {
      navigate('/invitation');
    }
  };

  const handleLoginSuccess = () => {
    setShowLoginPopup(false);
    // Re-fetch public invitations after successful login
    // This part of the logic needs to be re-evaluated if you want to refetch all invitations
    // or if you only want to refetch the ones that are currently displayed.
    // For now, we'll just close the popup.
  };

  const toggleDescription = (id) => {
    setExpandedDescriptions(prevState => ({
      ...prevState,
      [id]: !prevState[id]
    }));
  };

  const characterLimit = 150; // Define your character limit here

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

        <section className="upcoming-events-section">
          <h2 className="section-header">Upcoming Events</h2>
          <div className="events-scroll-container">
            {isLoading ? (
              <p>Loading invitations...</p>
            ) : error ? (
              <p style={{ color: 'red' }}>Error: {error}</p>
            ) : upcomingInvitations.length > 0 ? ( // Changed to upcomingInvitations
              upcomingInvitations.map((invitation) => (
                <div className="event-card" key={invitation._id} onClick={() => handleInvitationCardClick(invitation)}>
                  {invitation.invitationImage && (
                    <img src={invitation.invitationImage.url} alt="Event" className="event-card-image" />
                  )}
                  <div className="event-card-content">
                    {invitation.eventName && <p className="event-card-title">{invitation.eventName}</p>}
                    {invitation.dateTime && <p className="event-card-date">{new Date(invitation.dateTime).toLocaleDateString()}</p>}
                    <button className="view-details-button" onClick={(e) => { e.stopPropagation(); handleInvitationCardClick(invitation); }}>View Details</button>
                  </div>
                </div>
              ))
            ) : (
              <p>No upcoming events available yet.</p>
            )}
          </div>
        </section>

        <section className="featured-events-section">
          <h2 className="section-header">Events</h2>
          <div className="events-scroll-container">
            {isLoading ? (
              <p>Loading featured events...</p>
            ) : error ? (
              <p style={{ color: 'red' }}>Error: {error}</p>
            ) : pastOrCurrentInvitations.length > 0 ? ( // Changed to pastOrCurrentInvitations
              pastOrCurrentInvitations.map((invitation) => (
                <div className="featured-event-card" key={invitation._id} onClick={() => handleInvitationCardClick(invitation)}>
                  {invitation.invitationImage && (
                    <img src={invitation.invitationImage.url} alt="Featured Event" className="featured-event-image" />
                  )}
                  <div>
                    {invitation.eventName && <p className="featured-event-title">{invitation.eventName}</p>}
                    {invitation.description && (
                      <p className="featured-event-description">
                        {expandedDescriptions[invitation._id] || invitation.description.length <= characterLimit
                          ? invitation.description
                          : `${invitation.description.substring(0, characterLimit)}...`}
                        {invitation.description.length > characterLimit && (
                          <span className="read-more-less" onClick={(e) => { e.stopPropagation(); toggleDescription(invitation._id); }}>
                            {expandedDescriptions[invitation._id] ? ' less...' : ' more...'}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No featured events available yet.</p>
            )}
          </div>
        </section>
      </main>

      {showLoginPopup && (
        <LoginModal onLoginSuccess={handleLoginSuccess} onClose={() => setShowLoginPopup(false)} />
      )}
      {/* <nav className="navbar">
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
          <span>Invitations</span>
        </a>
        <a className="nav-item" href="#" onClick={handleCreateInvitationClick}>
          <span className="material-symbols-outlined nav-item-icon">add_circle</span>
          <span>Invite</span>
        </a>
        <a className="nav-item" href="#">
          <span className="material-symbols-outlined nav-item-icon">person</span>
          <span>Profile</span>
        </a>
      </nav> */}
    </div>
  );
}

export default Home;
