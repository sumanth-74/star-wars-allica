import React from 'react';
import { NavLink } from 'react-router-dom';
import { Group, Favorite } from '@mui/icons-material';
import './Navbar.css';

// Component
const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <img
            src={`${process.env.PUBLIC_URL}/star-wars-logo.svg`}
            alt="Star Wars Logo"
            className="logo"
          />
        </div>
        <NavLink
          to="/"
          className={({ isActive }) => `navbar-link ${isActive ? 'active-link' : ''}`}
        >
          <Group className="navbar-icon" /> Characters
        </NavLink>
        <NavLink
          to="/favorites"
          className={({ isActive }) => `navbar-link ${isActive ? 'active-link' : ''}`}
        >
          <Favorite className="navbar-icon" /> Favorites
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;