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
      <header className="header-container">
        <button className="back-button" onClick={() => navigate(-1)}><span className="material-symbols-outlined">arrow_back</span></button>
        <h1 className="header-title">Public Events</h1>
      </header>

      <main>
        <div className="hero-section">
          <h2 className="hero-title">Design Your Perfect Invitation</h2>
          <p className="hero-subtitle">Create beautiful and personalized cards for any occasion.</p>
          <button className="create-invite-button" onClick={handleCreateInvitationClick}>
            Create Invite
          </button>
        </div>

        <div className="event-section">
          <div className="section-header">
            <h2 className="section-title">Upcoming Events</h2>
            <a className="see-all-link" href="#">See all</a>
          </div>
          <div className="scroll-container">
            {isLoading ? (
              <p>Loading invitations...</p>
            ) : error ? (
              <p style={{ color: 'red' }}>Error: {error}</p>
            ) : allInvitations.length > 0 ? (
              allInvitations.map((invitation) => (
                <div className="event-card" key={invitation._id} onClick={() => handleInvitationCardClick(invitation)}>
                  <div className="event-image" style={{ backgroundImage: `url("${invitation.invitationImage ? invitation.invitationImage.url : 'https://via.placeholder.com/150'}")` }}></div>
                  <div className="event-details">
                    {invitation.eventName && <p className="event-name">{invitation.eventName}</p>}
                    {invitation.dateTime && <p className="event-date">{new Date(invitation.dateTime).toLocaleString()}</p>}
                    <button className="view-details-button">View Details</button>
                  </div>
                </div>
              ))
            ) : (
              <p>No invitations available yet.</p>
            )}
          </div>
        </div>

        <div className="featured-event-section">
          <h2 className="featured-event-title">Featured Events</h2>
          <div className="featured-scroll-container">
            <div className="featured-event-card">
              <div className="featured-event-image" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDb-jL9h2E5Wmte8AmGojZCZjBzL_QEeRE1UBXZZ8TN2hzujGzJWt805QTM-mgEkuIckQ8vShYya-PXxupBZiwsTICOON28H1xom0WJZcbosjg2cwVHXECdzPzY3wbsNSc6i6o6pChfyb7dCF8tNsFPXm58R2Xl4yZUrboryXTYtkISueewByKUGumuZBuAyFFACICV3tlRCza33Kr9Lj5RYDZL4da-y7-ExDsD3J8cyxorB1OZxGb19mL6xu6m32DsuV-ZdXQeUOI")' }}></div>
              <div>
                <p className="featured-event-name">Live Music Night</p>
                <p className="featured-event-description">Join us for an evening of live music</p>
              </div>
            </div>
            <div className="featured-event-card">
              <div className="featured-event-image" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCc79HeEZ1GmFFBB2WtTuOT7bcpxxCtFgNquZnPl5sMlh_keLfg-7X-355htjnEIynDYby2fSF3Dodmg2MlCCQUQpemqTVThKLkLshUgDC9TPrFE8Zz12aiFCCN87M7Qp3ytq1VHzbcd98hV1rdOyn-PH0zJl1fiTGKCnwksPzVdhWPCWbJlhWXB3FDk54JrOBwb2ut4DtNY08pddmF2G6boTgIPA4eI6omt3y-qDFWoR3f6iWU5D3W63G20I7INhjANK8TC-MnvI8")' }}></div>
              <div>
                <p className="featured-event-name">Art & Culture Expo</p>
                <p className="featured-event-description">Explore contemporary art and cultural exhibits</p>
              </div>
            </div>
            <div className="featured-event-card">
              <div className="featured-event-image" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCq6aU9VWl7TjYBEyBE93Z5csEGpqf1iG6ZsybtXEHQ0YQ7SJcPchcL0YFXyRIjb83T5E-cLqU22PJopnqnZFGVSdfukRu3h8qdSH4ayDejnR2t967Y8PTyd-d1Yuapl7aBEDctO7PcuDEEcB9CjJTFp8bXkkQfAAwYRI1qG1Qn6MOIg51eIl98W7_CllaoMlLXayjpcOgd9opZgWuyqg_u2qe678BdT5Bv3HXldYf-jCAZan0sXq7aJd4vGmF17edm_pR_dio-34Q")' }}></div>
              <div>
                <p className="featured-event-name">Taste of the City</p>
                <p className="featured-event-description">A culinary journey through the city's best flavors</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <nav className="bottom-nav">
        <div className="nav-items">
          <a className="nav-item" onClick={() => navigate('/home')}>
            <span className="material-symbols-outlined nav-icon">home</span>
            <span className="nav-text">Home</span>
          </a>
          <a className="nav-item" onClick={() => navigate('/invited')}>
            <span className="material-symbols-outlined nav-icon">mail</span>
            <span className="nav-text">Invited</span>
          </a>
          <a className="nav-item" onClick={handleCreateInvitationClick}>
            <span className="material-symbols-outlined nav-icon">add_circle</span>
            <span className="nav-text">Invite</span>
          </a>
          <a className="nav-item" onClick={() => navigate('/profile')}>
            <span className="material-symbols-outlined nav-icon">person</span>
            <span className="nav-text">Profile</span>
          </a>
        </div>
      </nav>
    </div>
  );
}

export default Home;
