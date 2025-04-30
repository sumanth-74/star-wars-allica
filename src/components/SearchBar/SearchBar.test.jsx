import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from './SearchBar';

describe('SearchBar Component', () => {
  it('renders the input and button', () => {
    render(<SearchBar onSearch={jest.fn()} />);

    expect(screen.getByPlaceholderText('Search by name...')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
  });

  it('calls onSearch with the correct input value', () => {
    const mockOnSearch = jest.fn();
    render(<SearchBar onSearch={mockOnSearch} />);

    const input = screen.getByPlaceholderText('Search by name...');
    const button = screen.getByText('Search');

    fireEvent.change(input, { target: { value: 'Luke Skywalker' } });
    fireEvent.click(button);

    expect(mockOnSearch).toHaveBeenCalledWith('Luke Skywalker');
  });
});