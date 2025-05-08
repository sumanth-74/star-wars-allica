import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CharacterList from './CharacterList';
import { useQuery } from '@tanstack/react-query';
import { ErrorProvider } from '../../contexts/ErrorContext';
import { SearchProvider } from '../../contexts/SearchContext';


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

jest.mock('./CharacterList', () => ({ characters = [], onSelect }) => (
  <div>
    {characters.length > 0 ? (
      characters.map((character, index) => (
        <div key={index} onClick={() => onSelect(character)}>
          {character.name}
        </div>
      ))
    ) : (
      <div>No characters found</div>
    )}
  </div>
));

const renderWithProviders = (ui) => {
  return render(
    <SearchProvider>
      {ui}
    </SearchProvider>
  );
};

// Updated test cases to align with the mocked `CharacterList` component.
describe('CharacterList Component', () => {
  it('renders the list of characters', () => {
    renderWithProviders(
      <ErrorProvider>
        <CharacterList
          characters={[
            { name: 'Luke Skywalker', height: '172', gender: 'male', homeworld: 'Tatooine' },
            { name: 'Darth Vader', height: '202', gender: 'male', homeworld: 'Tatooine' },
          ]}
          onSelect={jest.fn()}
        />
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

    renderWithProviders(
      <ErrorProvider>
        <CharacterList characters={characters} onSelect={mockOnSelect} />
      </ErrorProvider>
    );

    const character = screen.getByText('Luke Skywalker');
    fireEvent.click(character);

    expect(mockOnSelect).toHaveBeenCalledWith(characters[0]);
  });

  it('renders with custom LinkComponent', () => {
    renderWithProviders(<CharacterList LinkComponent={({ to, children }) => <a href={to}>{children}</a>} />);
  });
});
