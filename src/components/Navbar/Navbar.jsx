import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHeart, FaUsers } from 'react-icons/fa'; // Import icons
import '../../App.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
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
