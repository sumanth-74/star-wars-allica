import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHeart, FaUsers } from 'react-icons/fa';
import './Navbar.css'; // Import styles

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <img src={`${process.env.PUBLIC_URL}/star-wars-logo.svg`} alt="Star Wars Logo" className="logo" />
        </div>
        <NavLink to="/" className="navbar-link" activeClassName="active-link">
          <FaUsers className="navbar-icon" /> Characters
        </NavLink>
        <NavLink to="/favorites" className="navbar-link" activeClassName="active-link">
          <FaHeart className="navbar-icon" /> Favorites
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
