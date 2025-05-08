import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';

describe('Pagination Component', () => {
  it('renders the correct number of page buttons', () => {
    render(<Pagination totalPages={2} currentPage={1} onPageChange={jest.fn()} />);

    expect(screen.getAllByRole('button').length).toBe(2);
  });

  it('calls onPageChange with the previous page when handlePrevious is triggered', () => {
    const mockOnPageChange = jest.fn();
    render(<Pagination totalPages={3} currentPage={2} onPageChange={mockOnPageChange} />);

    const previousButton = screen.getByText('Previous');
    fireEvent.click(previousButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange with the next page when handleNext is triggered', () => {
    const mockOnPageChange = jest.fn();
    render(<Pagination totalPages={3} currentPage={2} onPageChange={mockOnPageChange} />);

    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);

    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });
});