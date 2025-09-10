import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './Dashboard.css'; // We'll create this CSS file next

function Dashboard() {
  const { date } = useParams();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('accessToken');
        const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

        const [totalUsersRes, totalInvitationsRes, privateInvitationsRes, publicInvitationsRes, photoUploadsRes] = await Promise.all([
          fetch('https://invite-backend-vk36.onrender.com/users/dashboard/totalUsers', { headers }),
          fetch('https://invite-backend-vk36.onrender.com/invitations/dashboard/total', { headers }),
          fetch('https://invite-backend-vk36.onrender.com/invitations/dashboard/private', { headers }),
          fetch('https://invite-backend-vk36.onrender.com/invitations/dashboard/public', { headers }),
          fetch('https://invite-backend-vk36.onrender.com/invitations/dashboard/photos', { headers }),
        ]);

        const totalUsersData = await totalUsersRes.json();
        const totalInvitationsData = await totalInvitationsRes.json();
        const privateInvitationsData = await privateInvitationsRes.json();
        const publicInvitationsData = await publicInvitationsRes.json();
        const photoUploadsData = await photoUploadsRes.json();

        if (!totalUsersRes.ok) throw new Error(totalUsersData.message || 'Failed to fetch total users');
        if (!totalInvitationsRes.ok) throw new Error(totalInvitationsData.message || 'Failed to fetch total invitations');
        if (!privateInvitationsRes.ok) throw new Error(privateInvitationsData.message || 'Failed to fetch private invitations');
        if (!publicInvitationsRes.ok) throw new Error(publicInvitationsData.message || 'Failed to fetch public invitations');
        if (!photoUploadsRes.ok) throw new Error(photoUploadsData.message || 'Failed to fetch photo uploads');

        setDashboardData({
          totalUsers: totalUsersData.totalUsers,
          totalInvitations: totalInvitationsData.totalInvitations,
          privateInvitations: privateInvitationsData.privateInvitations,
          publicInvitations: publicInvitationsData.publicInvitations,
          photoUploads: photoUploadsData.photoUploads,
        });

      } catch (err) {
        setError(err.message);
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [date]); // Re-fetch if date changes

  if (loading) return <div className="dashboard-container">Loading dashboard...</div>;
  if (error) return <div className="dashboard-container" style={{ color: 'red' }}>Error: {error}</div>;
  if (!dashboardData) return <div className="dashboard-container">No dashboard data available.</div>;

  const totalInvites = dashboardData.totalInvitations;
  const privateInvitesPercentage = totalInvites > 0 ? ((dashboardData.privateInvitations / totalInvites) * 100).toFixed(1) : 0;
  const publicInvitesPercentage = totalInvites > 0 ? ((dashboardData.publicInvitations / totalInvites) * 100).toFixed(1) : 0;

  // Dummy data for trends and per user stats for now
  const dummyTrend = (Math.random() * 30 - 15).toFixed(1); // -15 to +15
  const trendColor = dummyTrend >= 0 ? 'green' : 'red';

  const photosPerUser = dashboardData.totalUsers > 0 ? (dashboardData.photoUploads / dashboardData.totalUsers).toFixed(1) : 0;
  const invitesPerUser = dashboardData.totalUsers > 0 ? (dashboardData.totalInvitations / dashboardData.totalUsers).toFixed(1) : 0;

  return (
    <div className="dashboard-container">
      <h1>Analytics Dashboard</h1>
      <p className="dashboard-subtitle">Monitor your platform's key metrics and user engagement</p>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-content">
            <p className="kpi-title">TOTAL USERS</p>
            <h2 className="kpi-value">{dashboardData.totalUsers.toLocaleString()}</h2>
            <p className="kpi-trend" style={{ color: trendColor }}>
              <span className={`arrow ${dummyTrend >= 0 ? 'up' : 'down'}`}></span> {Math.abs(dummyTrend)}% vs last month
            </p>
          </div>
          <div className="kpi-icon" style={{ backgroundColor: '#4285F4' }}><img src="https://img.icons8.com/ios-filled/30/ffffff/group.png" alt="Users" /></div>
        </div>

        <div className="kpi-card">
          <div className="kpi-content">
            <p className="kpi-title">TOTAL INVITATIONS</p>
            <h2 className="kpi-value">{dashboardData.totalInvitations.toLocaleString()}</h2>
            <p className="kpi-trend" style={{ color: trendColor }}>
              <span className={`arrow ${dummyTrend >= 0 ? 'up' : 'down'}`}></span> {Math.abs(dummyTrend)}% vs last month
            </p>
          </div>
          <div className="kpi-icon" style={{ backgroundColor: '#34A853' }}><img src="https://img.icons8.com/ios-filled/30/ffffff/new-post.png" alt="Invitations" /></div>
        </div>

        <div className="kpi-card">
          <div className="kpi-content">
            <p className="kpi-title">PRIVATE INVITATIONS</p>
            <h2 className="kpi-value">{dashboardData.privateInvitations.toLocaleString()}</h2>
            <p className="kpi-trend" style={{ color: trendColor }}>
              <span className={`arrow ${dummyTrend >= 0 ? 'up' : 'down'}`}></span> {Math.abs(dummyTrend)}% vs last month
            </p>
          </div>
          <div className="kpi-icon" style={{ backgroundColor: '#8E24AA' }}><img src="https://img.icons8.com/ios-filled/30/ffffff/lock.png" alt="Private" /></div>
        </div>

        <div className="kpi-card">
          <div className="kpi-content">
            <p className="kpi-title">PUBLIC INVITATIONS</p>
            <h2 className="kpi-value">{dashboardData.publicInvitations.toLocaleString()}</h2>
            <p className="kpi-trend" style={{ color: trendColor }}>
              <span className={`arrow ${dummyTrend >= 0 ? 'up' : 'down'}`}></span> {Math.abs(dummyTrend)}% vs last month
            </p>
          </div>
          <div className="kpi-icon" style={{ backgroundColor: '#F97A00' }}><img src="https://img.icons8.com/ios-filled/30/ffffff/globe--v1.png" alt="Public" /></div>
        </div>

        <div className="kpi-card">
          <div className="kpi-content">
            <p className="kpi-title">PHOTO UPLOADS</p>
            <h2 className="kpi-value">{dashboardData.photoUploads.toLocaleString()}</h2>
            <p className="kpi-trend" style={{ color: trendColor }}>
              <span className={`arrow ${dummyTrend >= 0 ? 'up' : 'down'}`}></span> {Math.abs(dummyTrend)}% vs last month
            </p>
          </div>
          <div className="kpi-icon" style={{ backgroundColor: '#E91E63' }}><img src="https://img.icons8.com/ios-filled/30/ffffff/camera--v1.png" alt="Photos" /></div>
        </div>
      </div>

      <div className="quick-stats-container">
        <h2>Quick Stats</h2>
        <div className="quick-stats-grid">
          <div className="stat-card" style={{ backgroundColor: '#E8EAF6' }}>
            <h3>{privateInvitesPercentage}%</h3>
            <p>Private Invites</p>
          </div>
          <div className="stat-card" style={{ backgroundColor: '#E0F2F1' }}>
            <h3>{publicInvitesPercentage}%</h3>
            <p>Public Invites</p>
          </div>
          <div className="stat-card" style={{ backgroundColor: '#F3E5F5' }}>
            <h3>{photosPerUser}</h3>
            <p>Photos per User</p>
          </div>
          <div className="stat-card" style={{ backgroundColor: '#FFF3E0' }}>
            <h3>{invitesPerUser}</h3>
            <p>Invites per User</p>
          </div>
        </div>
      </div>

      <div className="recent-activity-container">
        <h2>Recent Activity <span className="activity-icon"></span></h2>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-dot" style={{ backgroundColor: '#4285F4' }}></span>
            <p>152 new users registered today <span className="activity-time">2 hours ago</span></p>
          </div>
          <div className="activity-item">
            <span className="activity-dot" style={{ backgroundColor: '#34A853' }}></span>
            <p>847 photos uploaded this week <span className="activity-time">5 hours ago</span></p>
          </div>
          <div className="activity-item">
            <span className="activity-dot" style={{ backgroundColor: '#8E24AA' }}></span>
            <p>234 invitations sent yesterday <span className="activity-time">1 day ago</span></p>
          </div>
        </div>
      </div>

      <p className="dashboard-last-updated">Dashboard last updated: {new Date().toLocaleString()}</p>

    </div>
  );
}

export default Dashboard;
