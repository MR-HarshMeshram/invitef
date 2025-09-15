import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Home.css'; // Custom CSS for the Home page
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

  const upcomingEventsRef = React.useRef(null); // Ref for upcoming events scroll container
  const featuredEventsRef = React.useRef(null); // Ref for featured events scroll container

  const [showLeftArrowUpcoming, setShowLeftArrowUpcoming] = useState(false);
  const [showRightArrowUpcoming, setShowRightArrowUpcoming] = useState(false);
  const [showLeftArrowFeatured, setShowLeftArrowFeatured] = useState(false);
  const [showRightArrowFeatured, setShowRightArrowFeatured] = useState(false);

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

  // Handle scroll for upcoming events
  const handleUpcomingScroll = () => {
    if (upcomingEventsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = upcomingEventsRef.current;
      setShowLeftArrowUpcoming(scrollLeft > 0);
      setShowRightArrowUpcoming(scrollLeft < scrollWidth - clientWidth);
    }
  };

  // Handle scroll for featured events
  const handleFeaturedScroll = () => {
    if (featuredEventsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = featuredEventsRef.current;
      setShowLeftArrowFeatured(scrollLeft > 0);
      setShowRightArrowFeatured(scrollLeft < scrollWidth - clientWidth);
    }
  };

  // Set up observers for scroll containers
  useEffect(() => {
    const upcomingRefCurrent = upcomingEventsRef.current;
    const featuredRefCurrent = featuredEventsRef.current;

    if (upcomingRefCurrent) {
      upcomingRefCurrent.addEventListener('scroll', handleUpcomingScroll);
      handleUpcomingScroll(); // Initial check
    }
    if (featuredRefCurrent) {
      featuredRefCurrent.addEventListener('scroll', handleFeaturedScroll);
      handleFeaturedScroll(); // Initial check
    }

    return () => {
      if (upcomingRefCurrent) {
        upcomingRefCurrent.removeEventListener('scroll', handleUpcomingScroll);
      }
      if (featuredRefCurrent) {
        featuredRefCurrent.removeEventListener('scroll', handleFeaturedScroll);
      }
    };
  }, [upcomingInvitations, pastOrCurrentInvitations]); // Re-run when data changes

  const scroll = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = ref.current.clientWidth / 2; // Scroll half the visible width
      ref.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="home-container">
      {/* <header className="header">
        <button className="header-button" onClick={() => navigate(-1)}>
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="header-title">Public Events</h1>
      </header> */}

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
          <div className="events-scroll-wrapper">
            {showLeftArrowUpcoming && (
              <button className="scroll-arrow left" onClick={() => scroll(upcomingEventsRef, 'left')}>
                <span className="material-symbols-outlined">arrow_back_ios</span>
              </button>
            )}
            <div className="events-scroll-container" ref={upcomingEventsRef}>
              {isLoading ? (
                <p>Loading invitations...</p>
              ) : error ? (
                <p style={{ color: 'red' }}>Error: {error}</p>
              ) : upcomingInvitations.length > 0 ? (
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
            {showRightArrowUpcoming && (
              <button className="scroll-arrow right" onClick={() => scroll(upcomingEventsRef, 'right')}>
                <span className="material-symbols-outlined">arrow_forward_ios</span>
              </button>
            )}
          </div>
        </section>

        <section className="featured-events-section">
          <h2 className="section-header">Events</h2>
          <div className="events-scroll-wrapper">
            {showLeftArrowFeatured && (
              <button className="scroll-arrow left" onClick={() => scroll(featuredEventsRef, 'left')}>
                <span className="material-symbols-outlined">arrow_back_ios</span>
              </button>
            )}
            <div className="events-scroll-container" ref={featuredEventsRef}>
              {isLoading ? (
                <p>Loading featured events...</p>
              ) : error ? (
                <p style={{ color: 'red' }}>Error: {error}</p>
              ) : pastOrCurrentInvitations.length > 0 ? (
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
            {showRightArrowFeatured && (
              <button className="scroll-arrow right" onClick={() => scroll(featuredEventsRef, 'right')}>
                <span className="material-symbols-outlined">arrow_forward_ios</span>
              </button>
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
