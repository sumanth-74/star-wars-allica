import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { FaHeart, FaUsers } from 'react-icons/fa'; // Import heart and users icons
import CharacterList from './components/CharacterList';
import CharacterDetails from './components/CharacterDetails';
import Favorites from './components/Favorites';
import FavoritesProvider from './contexts/FavoritesContext';
import './App.css'; // Import styles

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <FavoritesProvider>
        <Router>
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
          <Routes>
            <Route path="/" element={<CharacterList />} />
            <Route path="/character/:id" element={<CharacterDetails />} />
            <Route path="/favorites" element={<Favorites />} />
          </Routes>
        </Router>
      </FavoritesProvider>
    </QueryClientProvider>
  );
};

export default App;