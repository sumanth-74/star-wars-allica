import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { QueryClient } from '@tanstack/react-query';

interface Character {
  url?: string;
  name: string;
  height?: string;
  gender?: string;
  homeworld?: string;
}

interface FavoritesContextType {
  favorites: Character[];
  addFavorite: (character: Character) => void;
  removeFavorite: (url: string) => void;
  updateCharacter: (queryClient: QueryClient, url: string, updates: Partial<Character>) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites must be used within FavoritesProvider');
  return context;
};

export const FavoritesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [favorites, setFavorites] = useState<Character[]>([]);

  const addFavorite = useCallback((character: Character) => {
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

  const removeFavorite = useCallback((url: string) => {
    setFavorites((prev) => prev.filter((char) => char.url !== url));
  }, []);

  const updateCharacter = useCallback(
    (queryClient: QueryClient, url: string, updates: Partial<Character>) => {
      // Update favorites array
      setFavorites((prev) =>
        prev.map((char) => (char.url === url ? { ...char, ...updates } : char))
      );

      // Extract uid from url (e.g., https://www.swapi.tech/api/people/1 -> 1)
      const uid = url.split('/').filter(Boolean).pop();

      // Update React Query cache for the character
      queryClient.setQueryData(['character', uid], (oldData: any) => {
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
    },
    []
  );

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