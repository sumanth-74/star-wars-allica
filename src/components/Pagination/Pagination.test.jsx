import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';

describe('Pagination Component', () => {
  it('renders the correct number of page buttons', () => {
    render(<Pagination totalPages={2} currentPage={1} onPageChange={jest.fn()} />);

    expect(screen.getAllByRole('button').length).toBe(2);
  });
});