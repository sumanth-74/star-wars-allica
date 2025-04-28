import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CharacterList from './CharacterList';

const queryClient = new QueryClient();

test('renders character list', async () => {
  render(
    <QueryClientProvider client={queryClient}>
      <CharacterList />
    </QueryClientProvider>
  );

  expect(screen.getByText(/Star Wars Characters/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/Search by name/i)).toBeInTheDocument();
});

test('handles search input', async () => {
  render(
    <QueryClientProvider client={queryClient}>
      <CharacterList />
    </QueryClientProvider>
  );

  const searchInput = screen.getByPlaceholderText(/Search by name/i);
  fireEvent.change(searchInput, { target: { value: 'Luke' } });
  expect(searchInput.value).toBe('Luke');
});
