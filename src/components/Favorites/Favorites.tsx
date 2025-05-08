import React from 'react';
import { useFavorites } from '../../contexts/FavoritesContext';
import './Favorites.css';

const Favorites: React.FC = () => {
  const { favorites, removeFavorite } = useFavorites();

  if (favorites.length === 0) {
    return <div className="container"><h1>No favorites added yet!</h1></div>;
  }

  return (
    <div className="container">
      <h1 className="title">Favorite Characters</h1>
      <div className="character-list">
        {favorites.map((char, index) => (
          <div key={index} className="character-card">
            <h3 className="character-name">{char.name}</h3>
            <p className="character-detail">Height: {char.height || 'unknown'}</p>
            <p className="character-detail">Gender: {char.gender || 'unknown'}</p>
            <p className="character-detail">
              Homeworld: {char.homeworld || 'unknown'}
            </p>
            <button
              onClick={() => {
                if (char.url) {
                  removeFavorite(char.url); // Remove character from favorites
                }
              }}
              className="remove-button"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Favorites;
