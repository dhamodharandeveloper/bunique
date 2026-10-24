import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProfileSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = (e) => { e.preventDefault(); logout(); navigate('/'); };

  return (
    <aside className="profile-sidebar">
      <div className="profile-user">
        <div className="profile-avatar">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
        <h6>{user?.name || 'Guest'}</h6>
        <small>{user?.email || ''}</small>
      </div>
      <ul className="profile-menu">
        <li><Link to="/profile"><i className="bi bi-person"></i> My Profile</Link></li>
        <li><Link to="/my-orders"><i className="bi bi-receipt"></i> My Orders</Link></li>
        <li><Link to="/wishlist"><i className="bi bi-heart"></i> Wishlist</Link></li>
        <li><Link to="/change-password"><i className="bi bi-lock"></i> Change Password</Link></li>
        <li><a href="#" onClick={handleLogout}><i className="bi bi-box-arrow-right"></i> Logout</a></li>
      </ul>
    </aside>
  );
};

export default ProfileSidebar;
