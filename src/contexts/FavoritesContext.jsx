import React, { createContext, useContext, useState, useCallback } from 'react';
import { fetchCharacter, fetchPlanet } from '../services/api'; // Updated path

const FavoritesContext = createContext(null);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [characters, setCharacters] = useState({}); // Cache for characters
  const [planetsCache, setPlanetsCache] = useState({}); // Persistent cache for planets
  const [loading, setLoading] = useState(false); // Track overall loading state
  const ongoingPlanetRequests = new Map(); // Track ongoing planet requests
  const [ongoingRequests, setOngoingRequests] = useState(new Set()); // Track ongoing character API calls

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
        setLoading(true); // Start loading

        // Fetch character details
        const charId = charUrl.split('/').filter(Boolean).pop();
        const details = await fetchCharacter(charId);

        // Extract homeworld URL from details
        const homeworldUrl = details.result.properties.homeworld;

        // Check if the planet is already cached
        let homeworldName = planetsCache[homeworldUrl];
        if (homeworldName) {
          console.log(`Using cached planet details for ${homeworldUrl}`);
        } else if (homeworldUrl) {
          // Check if a request for this planet is already in progress
          if (ongoingPlanetRequests.has(homeworldUrl)) {
            homeworldName = await ongoingPlanetRequests.get(homeworldUrl); // Wait for the ongoing request to complete
          } else {
            try {
              console.log(`Fetching planet details for ${homeworldUrl}`);
              const planetPromise = fetchPlanet(homeworldUrl).then((planetDetails) => {
                const name = planetDetails.result.properties.name;
                setPlanetsCache((prev) => ({
                  ...prev,
                  [homeworldUrl]: name, // Update the cache
                }));
                ongoingPlanetRequests.delete(homeworldUrl); // Remove from ongoing requests
                return name;
              });
              ongoingPlanetRequests.set(homeworldUrl, planetPromise); // Track the ongoing request
              homeworldName = await planetPromise; // Wait for the request to complete
            } catch (error) {
              console.error(`Failed to fetch planet details for ${homeworldUrl}:`, error);
              homeworldName = 'unknown'; // Fallback to 'unknown' if the API call fails
              ongoingPlanetRequests.delete(homeworldUrl); // Remove from ongoing requests
            }
          }
        }

        // Construct character object with all properties
        const character = {
          ...details.result.properties, // Include all properties from the API response
          uid: charId,
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
        setLoading(false); // End loading
      }
    },
    [characters, ongoingRequests, planetsCache, ongoingPlanetRequests, addCharacter]
  );

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        characters,
        loading, // Expose the loading state
        addFavorite,
        removeFavorite,
        updateCharacter,
        addCharacter,
        fetchAndCacheCharacter, // Expose the new function
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesProvider;