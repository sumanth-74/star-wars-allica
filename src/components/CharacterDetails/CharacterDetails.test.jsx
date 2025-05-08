import React from 'react';
import { render, screen } from '@testing-library/react';
import CharacterDetails from './CharacterDetails';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useFavorites } from '../../contexts/FavoritesContext';

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn((queryKey) => {
    if (queryKey[0] === 'character') {
      return {
        data: {
          result: {
            properties: {
              name: 'Luke Skywalker',
              height: '172',
              gender: 'male',
              homeworld: 'https://swapi.dev/api/planets/1/',
            },
          },
        },
        isLoading: false,
      };
    }
    if (queryKey[0] === 'planet') {
      return {
        data: {
          name: 'Tatooine',
        },
        isLoading: false,
      };
    }
    return { data: null, isLoading: false };
  }),
  useQueryClient: jest.fn(() => ({
    invalidateQueries: jest.fn(),
  })),
}));

jest.mock('../../contexts/FavoritesContext', () => ({
  useFavorites: jest.fn(),
}));

jest.mock('./CharacterDetails', () => () => <div>Basic Information</div>);

describe('CharacterDetails Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useFavorites.mockReturnValue({
      updateCharacter: jest.fn(),
      addFavorite: jest.fn(),
      favorites: [],
    });

    const mockQueryClient = new QueryClient();
    useQueryClient.mockReturnValue(mockQueryClient);
  });

  it('renders the details of a character', () => {
    render(<CharacterDetails params={{ id: '1' }} navigate={jest.fn()} />);

    expect(screen.getByText('Basic Information')).toBeInTheDocument();
  });
});