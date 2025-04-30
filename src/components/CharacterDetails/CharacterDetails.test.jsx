import React from 'react';
import { render, screen } from '@testing-library/react';
import CharacterDetails from './CharacterDetails';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, QueryClient, useQueryClient } from '@tanstack/react-query';
import { useFavorites } from '../../contexts/FavoritesContext';

jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
  useNavigate: jest.fn(),
}));

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

describe('CharacterDetails Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    useParams.mockReturnValue({ id: '1' });
    useNavigate.mockReturnValue(jest.fn());

    useFavorites.mockReturnValue({
      updateCharacter: jest.fn(),
      addFavorite: jest.fn(),
      favorites: [],
    });

    const mockQueryClient = new QueryClient();
    useQueryClient.mockReturnValue(mockQueryClient);
  });

  it('renders the details of a character', () => {
    render(<CharacterDetails />);

    expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
    expect(screen.getByText('Height:')).toBeInTheDocument();
    expect(screen.getByText('172')).toBeInTheDocument();
    expect(screen.getByText('Gender:')).toBeInTheDocument();
    expect(screen.getByText('male')).toBeInTheDocument();
    expect(screen.getByText('Homeworld:')).toBeInTheDocument();
    expect(screen.getByText('Tatooine')).toBeInTheDocument();
  });
});