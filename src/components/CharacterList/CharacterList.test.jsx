import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CharacterList from './CharacterList';
import { useQuery } from '@tanstack/react-query';
import { ErrorProvider } from '../../contexts/ErrorContext';

jest.mock('react-router-dom', () => ({
  Link: ({ children, to }) => <a href={to}>{children}</a>,
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(() => ({
    data: [
      { name: 'Luke Skywalker', height: '172', gender: 'male', homeworld: 'Tatooine' },
      { name: 'Darth Vader', height: '202', gender: 'male', homeworld: 'Tatooine' },
    ],
    isLoading: false,
    error: null,
  })),
}));

describe('CharacterList Component', () => {
  it('renders the list of characters', () => {
    render(
      <ErrorProvider>
        <CharacterList onSelect={jest.fn()} />
      </ErrorProvider>
    );

    expect(screen.getByText('Luke Skywalker')).toBeInTheDocument();
    expect(screen.getByText('Darth Vader')).toBeInTheDocument();
  });

  it('calls onSelect when a character is clicked', () => {
    const characters = [
      { name: 'Luke Skywalker', height: '172', gender: 'male', homeworld: 'Tatooine' },
      { name: 'Darth Vader', height: '202', gender: 'male', homeworld: 'Tatooine' },
    ];
    const mockOnSelect = jest.fn();

    render(
      <ErrorProvider>
        <CharacterList characters={characters} onSelect={mockOnSelect} />
      </ErrorProvider>
    );

    const character = screen.getByText('Luke Skywalker');
    fireEvent.click(character);

    expect(mockOnSelect).toHaveBeenCalledWith(characters[0]);
  });
});
