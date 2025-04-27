import React, { useEffect } from 'react';
import { useFavorites } from '../contexts/FavoritesContext';
import { fetchPlanet } from '../services/api';
import '../App.css'; // Ensure this import is correct

const Favorites = () => {
  const { favorites, removeFavorite, updateCharacter } = useFavorites();

  useEffect(() => {
    const fetchHomeworldNames = async () => {
      for (const char of favorites) {
        if (char.homeworld && !char.homeworldName) {
          try {
            const planetDetails = await fetchPlanet(char.homeworld);
            updateCharacter(char.url, { homeworldName: planetDetails.result.properties.name });
          } catch (error) {
            console.error(`Failed to fetch homeworld for ${char.name}:`, error);
          }
        }
      }
    };

    fetchHomeworldNames();
  }, [favorites, updateCharacter]);

  if (favorites.length === 0) {
    return <div className="container"><h1>No favorites added yet!</h1></div>;
  }

  return (
    <div className="container">
      <h1 className="title">Favorite Characters</h1>
      <div className="character-list">
        {favorites.map((char) => (
          <div key={char.url} className="character-card">
            <h3 className="character-name">{char.name}</h3>
            <p className="character-detail">Height: {char.height || 'unknown'}</p>
            <p className="character-detail">Gender: {char.gender || 'unknown'}</p>
            <p className="character-detail">
              Homeworld: {char.homeworldName || 'Loading...'}
            </p>
            <button
              onClick={() => {
                removeFavorite(char.url); // Remove character from favorites
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