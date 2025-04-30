import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Favorites from './Favorites';
import { useFavorites } from '../../contexts/FavoritesContext';

jest.mock('../../contexts/FavoritesContext', () => ({
  useFavorites: jest.fn(),
}));

describe('Favorites Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the list of favorite items', () => {
    useFavorites.mockReturnValue({
      favorites: [
        { name: 'Luke Skywalker', height: '172', gender: 'male', homeworld: 'Tatooine' },
        { name: 'Darth Vader', height: '202', gender: 'male', homeworld: 'Tatooine' },
      ],
      removeFavorite: jest.fn(),
    });

    render(<Favorites />);

    expect(screen.getByText('Luke Skywalker', { selector: 'h3.character-name' })).toBeInTheDocument();
    expect(screen.getByText('Darth Vader', { selector: 'h3.character-name' })).toBeInTheDocument();
  });

});