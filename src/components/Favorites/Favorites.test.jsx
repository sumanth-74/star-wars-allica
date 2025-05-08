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

  it('renders a message when there are no favorite items', () => {
    useFavorites.mockReturnValue({
      favorites: [],
      removeFavorite: jest.fn(),
    });

    render(<Favorites />);

    expect(screen.getByText('No favorites added yet!')).toBeInTheDocument();
  });

  it('removes a favorite item when the remove button is clicked', () => {
    const mockRemoveFavorite = jest.fn();
    useFavorites.mockReturnValue({
      favorites: [
        { name: 'Luke Skywalker', height: '172', gender: 'male', homeworld: 'Tatooine', url: '1' },
      ],
      removeFavorite: mockRemoveFavorite,
    });

    render(<Favorites />);

    const removeButton = screen.getByText('Remove');
    fireEvent.click(removeButton);

    expect(mockRemoveFavorite).toHaveBeenCalledWith('1');
  });

});