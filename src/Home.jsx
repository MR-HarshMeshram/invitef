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
    <div className="relative flex h-auto min-h-screen w-full flex-col group/design-root" style={{ fontFamily: "'Plus Jakarta Sans', 'Noto Sans', sans-serif" }}>
      <div className="flex-grow pb-20">
        <header className="sticky top-0 z-10 bg-[#faf8fc]/80 backdrop-blur-sm">
          <div className="flex items-center p-4 pb-2 justify-between">
            <button className="text-slate-900 flex size-10 items-center justify-center" onClick={() => navigate(-1)}><span className="material-symbols-outlined text-2xl"> arrow_back </span></button>
            <h1 className="text-slate-900 text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">Public Events</h1>
          </div>
        </header>
        <main className="flex-grow pb-10">
          <div className="relative bg-gradient-to-br from-purple-100 to-violet-200 px-4 py-8 text-center">
            <div className="relative z-10">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Design Your Perfect Invitation</h2>
              <p className="mt-2 text-slate-600">Create beautiful and personalized cards for any occasion.</p>
              <button className="mt-6 inline-flex items-center justify-center rounded-full bg-[var(--primary-color)] px-8 py-3 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105" onClick={handleCreateInvitationClick}>
                Create Invite
              </button>
            </div>
          </div>
          <div className="py-5">
            <div className="flex items-center justify-between px-4 pb-3">
              <h2 className="text-slate-900 text-2xl font-bold leading-tight tracking-[-0.015em]">Upcoming Events</h2>
              <a className="text-[var(--primary-color)] text-sm font-semibold" href="#">See all</a>
            </div>
            <div className="flex overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pl-4 pr-2">
              <div className="flex items-stretch gap-4">
                {/* Invitation cards will be rendered here */}
                {isLoading ? (
                  <p>Loading invitations...</p>
                ) : error ? (
                  <p style={{ color: 'red' }}>Error: {error}</p>
                ) : allInvitations.length > 0 ? (
                  allInvitations.map((invitation) => (
                    <div className="flex h-full w-72 flex-col rounded-2xl bg-white shadow-md" key={invitation._id} onClick={() => handleInvitationCardClick(invitation)} style={{ cursor: 'pointer' }}>
                      <div className="w-full h-40 bg-center bg-no-repeat bg-cover rounded-t-2xl" style={{ backgroundImage: `url("${invitation.invitationImage ? invitation.invitationImage.url : 'https://via.placeholder.com/150'} ")` }}></div>
                      <div className="p-4 flex flex-col flex-grow">
                        {invitation.eventName && <p className="text-slate-900 text-lg font-bold leading-tight">{invitation.eventName}</p>}
                        {invitation.dateTime && <p className="text-slate-500 text-sm font-normal leading-normal mt-1">{new Date(invitation.dateTime).toLocaleString()}</p>}
                        <button className="mt-4 w-full text-sm font-bold text-white bg-[var(--primary-color)] py-2.5 px-4 rounded-full">View Details</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p>No invitations available yet.</p>
                )}
              </div>
            </div>
          </div>
          <h2 className="text-slate-900 text-2xl font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-5">Featured Events</h2>
          <div className="flex overflow-x-auto [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pl-4 pr-2 pb-5">
            <div className="flex items-stretch gap-4">
              {/* Static Featured Events - can be replaced with dynamic data if needed */}
              <div className="flex h-full w-64 flex-col gap-3 rounded-xl">
                <div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDb-jL9h2E5Wmte8AmGojZCZjBzL_QEeRE1UBXZZ8TN2hzujGzJWt805QTM-mgEkuIckQ8vShYya-PXxupBZiwsTICOON28H1xom0WJZcbosjg2cwVHXECdzPzY3wbsNSc6i6o6pChfyb7dCF8tNsFPXm58R2Xl4yZUrboryXTYtkISueewByKUGumuZBuAyFFACICV3tlRCza33Kr9Lj5RYDZL4da-y7-ExDsD3J8cyxorB1OZxGb19mL6xu6m32DsuV-ZdXQeUOI")' }}></div>
                <div>
                  <p className="text-slate-900 text-base font-bold leading-normal">Live Music Night</p>
                  <p className="text-slate-500 text-sm font-normal leading-normal">Join us for an evening of live music</p>
                </div>
              </div>
              <div className="flex h-full w-64 flex-col gap-3 rounded-xl">
                <div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCc79HeEZ1GmFFBB2WtTuOT7bcpxxCtFgNquZnPl5sMlh_keLfg-7X-355htjnEIynDYby2fSF3Dodmg2MlCCQUQpemqTVThKLkLshUgDC9TPrFE8Zz12aiFCCN87M7Qp3ytq1VHzbcd98hV1rdOyn-PH0zJl1fiTGKCnwksPzVdhWPCWbJlhWXB3FDk54JrOBwb2ut4DtNY08pddmF2G6boTgIPA4eI6omt3y-qDFWoR3f6iWU5D3W63G20I7INhjANK8TC-MnvI8")' }}></div>
                <div>
                  <p className="text-slate-900 text-base font-bold leading-normal">Art & Culture Expo</p>
                  <p className="text-slate-500 text-sm font-normal leading-normal">Explore contemporary art and cultural exhibits</p>
                </div>
              </div>
              <div className="flex h-full w-64 flex-col gap-3 rounded-xl">
                <div className="w-full bg-center bg-no-repeat aspect-square bg-cover rounded-xl" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCq6aU9VWl7TjYBEyBE93Z5csEGpqf1iG6ZsybtXEHQ0YQ7SJcPchcL0YFXyRIjb83T5E-cLqU22PJopnqnZFGVSdfukRu3h8qdSH4ayDejnR2t967Y8PTyd-d1Yuapl7aBEDctO7PcuDEEcB9CjJTFp8bXkkQfAAwYRI1qG1Qn6MOIg51eIl98W7_CllaoMlLXayjpcOgd9opZgWuyqg_u2qe678BdT5Bv3HXldYf-jCAZan0sXq7aJd4vGmF17edm_pR_dio-34Q")' }}></div>
                <div>
                  <p className="text-slate-900 text-base font-bold leading-normal">Taste of the City</p>
                  <p className="text-slate-500 text-sm font-normal leading-normal">A culinary journey through the city's best flavors</p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_4px_rgba(0,0,0,0.05)]">
        <div className="flex justify-around items-center h-16">
          <a className="flex flex-col items-center justify-center text-center text-sm font-medium text-slate-500 transition-colors hover:text-[var(--primary-color)]" onClick={() => navigate('/home')}>
            <span className="material-symbols-outlined text-2xl">home</span>
            <span>Home</span>
          </a>
          <a className="flex flex-col items-center justify-center text-center text-sm font-medium text-slate-500 transition-colors hover:text-[var(--primary-color)]" onClick={() => navigate('/invited')}>
            <span className="material-symbols-outlined text-2xl">mail</span>
            <span>Invited</span>
          </a>
          <a className="flex flex-col items-center justify-center text-center text-sm font-medium text-slate-500 transition-colors hover:text-[var(--primary-color)]" onClick={handleCreateInvitationClick}>
            <span className="material-symbols-outlined text-2xl">add_circle</span>
            <span>Invite</span>
          </a>
          <a className="flex flex-col items-center justify-center text-center text-sm font-medium text-slate-500 transition-colors hover:text-[var(--primary-color)]" onClick={() => navigate('/profile')}>
            <span className="material-symbols-outlined text-2xl">person</span>
            <span>Profile</span>
          </a>
        </div>
      </nav>
    </div>
  );
}

export default Home;
