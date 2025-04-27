import React, { createContext, useContext, useState, useCallback } from 'react';

const FavoritesContext = createContext(null);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const [characters, setCharacters] = useState({}); // Store all characters globally

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

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        characters,
        addFavorite,
        removeFavorite,
        updateCharacter,
        addCharacter,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesProvider;