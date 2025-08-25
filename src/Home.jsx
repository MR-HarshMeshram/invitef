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
        setAllInvitations(result.invitations);
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
      <h1>Create invitations and <span className="highlight">bring people together</span></h1>
      <p className="subtitle">Simple, beautiful event invitations for every occasion</p>
      <div className="card-container">
        <div className="card create-invitation-card" onClick={handleCreateInvitationClick} style={{ cursor: 'pointer' }}>
          <img src="https://img.icons8.com/color/96/confetti.png" alt="Confetti icon" className="card-icon" />
          <h2>Create Invitation</h2>
          <p>Design stunning, personalized event invitations that wow your guests. Share memorable moments with beautiful, professional-quality invites.</p>
          <button className="get-started-button">GET STARTED</button>
        </div>
        <h2 className="show-events-title">Explore Invitations</h2> {/* Changed title */}

        {isLoading ? (
          <p>Loading invitations...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>Error: {error}</p>
        ) : allInvitations.length > 0 ? (
          allInvitations.map((invitation) => (
            <div className="card" key={invitation._id} onClick={() => handleInvitationCardClick(invitation)} style={{ cursor: 'pointer' }}>
              {invitation.invitationImage && (
                <img src={invitation.invitationImage.url} alt="Invitation Card" className="event-card-image" />
              )}
              <div className="event-details">
                {/* Add event date placeholder or actual date if available in invitation object */}
                <p className="event-date">Sun, 05 Oct, 7 PM</p>
                <p className="event-name">{invitation.eventName}</p>
                <p className="event-location">
                  <img src="https://img.icons8.com/ios-filled/20/000000/marker.png" alt="Location icon" /> {invitation.location}
                </p>
                <p className="event-host">Hosted by: {invitation.invitedBy}</p>
                <p className="event-privacy">
                  {invitation.eventPrivacy === 'private' ? (
                    <><img src="https://img.icons8.com/ios-filled/24/000000/lock.png" alt="Lock icon" className="lock-icon" /> Private</>
                  ) : (
                    <><img src="https://img.icons8.com/ios-filled/24/000000/globe--v1.png" alt="Public icon" className="globe-icon" /> Public</>
                  )}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p>No invitations available yet.</p>
        )}
      </div>
    </div>
  );
}

export default Home;
