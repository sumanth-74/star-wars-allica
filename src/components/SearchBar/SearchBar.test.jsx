import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from './SearchBar';
import { SearchProvider } from '../../contexts/SearchContext';
import { fetchCharacters } from '../../services/api';

jest.mock('../../services/api', () => ({
  fetchCharacters: jest.fn(),
}));

const renderWithProvider = (ui) => {
  return render(<SearchProvider>{ui}</SearchProvider>);
};

describe('SearchBar Component', () => {
  it('renders the input and button', () => {
    renderWithProvider(<SearchBar />);

    expect(screen.getByPlaceholderText('Search by name...')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('calls setSearchQuery with the correct input value', () => {
    renderWithProvider(<SearchBar />);

    const input = screen.getByPlaceholderText('Search by name...');
    const button = screen.getByText('Search');

    fireEvent.change(input, { target: { value: 'Luke Skywalker' } });
    fireEvent.click(button);
  });
});