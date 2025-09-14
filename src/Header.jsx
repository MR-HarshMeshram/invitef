import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="app-header">
      <nav className="header-nav">
        <Link to="/home" className="nav-item active">
          <span>HOME</span>
        </Link>
        <Link to="/invited" className="nav-item">
          <span>INVITED</span>
        </Link>
        <Link to="/my-invitations" className="nav-item">
          <span>MY INVITATIONS</span>
        </Link>
        <Link to="/profile" className="nav-item">
          <span>PROFILE</span>
        </Link>
      </nav>
    </header>
  );
}

export default Header;
