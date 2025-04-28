import React, { createContext, useContext, useState, useCallback } from 'react';
import { fetchCharacter, fetchPlanet } from '../services/api';

const FavoritesContext = createContext(null);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [characters, setCharacters] = useState({}); // Cache for characters
  const [planets, setPlanets] = useState({}); // Cache for planets
  const [ongoingRequests, setOngoingRequests] = useState(new Set()); // Track ongoing API calls

  const addFavorite = useCallback((character) => {
    setFavorites((prev) => [
      ...prev,
      { ...character, height: character.height || 'unknown', gender: character.gender || 'unknown' },
    ]);
  }, []);

  const removeFavorite = useCallback((url) => {
    setFavorites((prev) => prev.filter((char) => char.url !== url));
  }, []);

  const updateCharacter = useCallback((url, updates) => {
    setCharacters((prev) => ({
      ...prev,
      [url]: { ...prev[url], ...updates },
    }));
    setFavorites((prev) =>
      prev.map((char) => (char.url === url ? { ...char, ...updates } : char))
    );
  }, []);

  const addCharacter = useCallback((character) => {
    setCharacters((prev) => ({
      ...prev,
      [character.url]: character,
    }));
  }, []);

  const addPlanet = useCallback((url, name) => {
    setPlanets((prev) => ({
      ...prev,
      [url]: name,
    }));
  }, []);

  const fetchAndCacheCharacter = useCallback(
    async (charUrl) => {
      if (!charUrl) {
        console.error('Invalid character URL:', charUrl);
        return;
      }

      if (characters[charUrl]) {
        return characters[charUrl]; // Return cached character
      }

      if (ongoingRequests.has(charUrl)) {
        return; // Skip if the request is already ongoing
      }

      try {
        // Mark the request as ongoing
        setOngoingRequests((prev) => new Set(prev).add(charUrl));

        // Fetch character details
        const charId = charUrl.split('/').filter(Boolean).pop();
        const details = await fetchCharacter(charId);

        // Extract homeworld URL from details
        const homeworldUrl = details.result.properties.homeworld;

        // Fetch planet details if not cached
        let homeworldName = planets[homeworldUrl];
        if (homeworldUrl && !homeworldName) {
          try {
            const planetDetails = await fetchPlanet(homeworldUrl);
            homeworldName = planetDetails.result.properties.name;
            addPlanet(homeworldUrl, homeworldName);
          } catch (error) {
            console.error(`Failed to fetch planet details for ${homeworldUrl}:`, error);
            homeworldName = 'unknown'; // Fallback to 'unknown' if the API call fails
          }
        }

        // Construct character object
        const character = {
          uid: charId,
          name: details.result.properties.name,
          gender: details.result.properties.gender,
          height: details.result.properties.height,
          homeworld: homeworldName || 'unknown',
          url: charUrl,
        };

        addCharacter(character);
        return character;
      } catch (error) {
        console.error(`Failed to fetch character details for ${charUrl}:`, error);
      } finally {
        // Remove the request from ongoingRequests
        setOngoingRequests((prev) => {
          const updated = new Set(prev);
          updated.delete(charUrl);
          return updated;
        });
      }
    },
    [characters, planets, addCharacter, addPlanet, ongoingRequests]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        characters,
        planets,
        addFavorite,
        removeFavorite,
        updateCharacter,
        addCharacter,
        addPlanet,
        fetchAndCacheCharacter, // Expose the new function
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesProvider;