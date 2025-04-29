import React, { createContext, useContext, useState, useCallback } from 'react';

const FavoritesContext = createContext(null);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
};

export const FavoritesProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);

  const addFavorite = useCallback((character) => {
    setFavorites((prev) => {
      if (!prev.some((fav) => fav.url === character.url)) {
        return [
          ...prev,
          {
            ...character,
            height: character.height || 'unknown',
            gender: character.gender || 'unknown',
            homeworld: character.homeworld || 'unknown',
          },
        ];
      }
      return prev;
    });
  }, []);

  const removeFavorite = useCallback((url) => {
    setFavorites((prev) => prev.filter((char) => char.url !== url));
  }, []);

  const updateCharacter = useCallback((queryClient, url, updates) => {
    // Update favorites array
    setFavorites((prev) =>
      prev.map((char) => (char.url === url ? { ...char, ...updates } : char))
    );

    // Extract uid from url (e.g., https://www.swapi.tech/api/people/1 -> 1)
    const uid = url.split('/').filter(Boolean).pop();

    // Update React Query cache for the character
    queryClient.setQueryData(['character', uid], (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        result: {
          ...oldData.result,
          properties: {
            ...oldData.result.properties,
            ...updates,
          },
        },
      };
    });
  }, []);

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addFavorite,
        removeFavorite,
        updateCharacter,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export default FavoritesProvider;