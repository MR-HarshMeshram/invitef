import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
    <div class="relative flex h-auto min-h-screen w-full flex-col group/design-root" style={{ fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif" }}>
      <div class="flex-grow pb-20">
        <header class="sticky top-0 z-10 bg-[#faf8fc]/80 backdrop-blur-sm">
          <div class="flex items-center p-4 pb-2 justify-between">
            <button class="text-slate-900 flex size-10 items-center justify-center" onClick={() => navigate(-1)}><span class="material-symbols-outlined text-2xl"> arrow_back </span></button>
            <h1 class="text-slate-900 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">Public Events</h1>
          </div>
        </header>
        <main class="flex-grow pb-10">
          <div class="relative bg-gradient-to-br from-purple-100 to-violet-200 px-4 py-8 text-center">
            <div class="relative z-10">
              <h2 class="text-3xl font-bold tracking-tight text-slate-900">Design Your Perfect Invitation</h2>
              <p class="mt-2 text-slate-600">Create beautiful and personalized cards for any occasion.</p>
              <button class="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105" onClick={handleCreateInvitationClick}>
                Create Invite
              </button>
            </div>
          </div>

          <div class="py-5">
            <div class="flex items-center justify-between px-4 pb-3">
              <h2 class="text-slate-900 text-2xl font-bold leading-tight tracking-[-0.015em]">Upcoming Events</h2>
              <a class="text-primary text-sm font-semibold" href="#">See all</a>
            </div>
            <div class="flex overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pl-4 pr-2">
              <div class="flex items-stretch gap-4">
                {/* Upcoming Events will be mapped here */}
                {isLoading ? (
                  <p>Loading invitations...</p>
                ) : error ? (
                  <p style={{ color: 'red' }}>Error: {error}</p>
                ) : allInvitations.length > 0 ? (
                  allInvitations.map((invitation) => (
                    <div class="flex h-full w-72 flex-col rounded-2xl bg-white shadow-md" key={invitation._id} onClick={() => handleInvitationCardClick(invitation)} style={{ cursor: 'pointer' }}>
                      {invitation.invitationImage && (
                        <div class="w-full h-40 bg-center bg-no-repeat bg-cover rounded-t-2xl" style={{ backgroundImage: `url("${invitation.invitationImage.url}")` }}></div>
                      )}
                      <div class="p-4 flex flex-col flex-grow">
                        {invitation.eventName && <p class="text-slate-900 text-lg font-bold leading-tight">{invitation.eventName}</p>}
                        {invitation.dateTime && <p class="text-slate-500 text-sm font-normal leading-normal mt-1">{new Date(invitation.dateTime).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>}
                        <button class="mt-4 w-full text-sm font-bold text-white bg-primary py-2.5 px-4 rounded-full">View Details</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No invitations available yet.</p>
                )}
              </div>
            </div>
          </div>
        </main>
        <h2 class="text-slate-900 text-2xl font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Featured Events</h2>
        <div class="flex overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pl-4 pr-2 pb-5">
          <div class="flex items-stretch gap-4">
            {/* Featured Events will be mapped here */}
            {isLoading ? (
              <p>Loading featured events...</p>
            ) : error ? (
              <p style={{ color: 'red' }}>Error: {error}</p>
            ) : allInvitations.length > 0 ? (
              allInvitations.map((invitation) => (
                <div class="flex h-full w-64 flex-col gap-3 rounded-xl" key={invitation._id} onClick={() => handleInvitationCardClick(invitation)} style={{ cursor: 'pointer' }}>
                  {invitation.invitationImage && (
                    <div class="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl" style={{ backgroundImage: `url("${invitation.invitationImage.url}")` }}></div>
                  )}
                  <div>
                    {invitation.eventName && <p class="text-slate-900 text-base font-bold leading-normal">{invitation.eventName}</p>}
                    {invitation.description && <p class="text-slate-500 text-sm font-normal leading-normal">{invitation.description}</p>}
                  </div>
                </div>
              ))
            ) : (
              <p>No featured events available yet.</p>
            )}
          </div>
        </div>
        <nav class="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_4px_rgba(0,0,0,0.05)]">
          <div class="flex justify-around items-center h-16">
            <a class="flex flex-col items-center justify-center text-center text-sm font-medium text-slate-500 transition-colors hover:text-primary" href="#">
              <span class="material-symbols-outlined text-2xl">home</span>
              <span>Home</span>
            </a>
            <a class="flex flex-col items-center justify-center text-center text-sm font-medium text-slate-500 transition-colors hover:text-primary" href="#">
              <span class="material-symbols-outlined text-2xl">mail</span>
              <span>Invited</span>
            </a>
            <a class="flex flex-col items-center justify-center text-center text-sm font-medium text-slate-500 transition-colors hover:text-primary" href="#" onClick={handleCreateInvitationClick}>
              <span class="material-symbols-outlined text-2xl">add_circle</span>
              <span>Invite</span>
            </a>
            <a class="flex flex-col items-center justify-center text-center text-sm font-medium text-slate-500 transition-colors hover:text-primary" href="#">
              <span class="material-symbols-outlined text-2xl">person</span>
              <span>Profile</span>
            </a>
          </div>
        </nav>
      </div>
    </div>
  );
}

export default Home;
