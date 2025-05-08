import React from 'react';
import { render } from '@testing-library/react';
import Shimmer from './Shimmer';

describe('Shimmer Component', () => {
  it('renders without crashing', () => {
    const { container } = render(<Shimmer />);
    expect(container.firstChild).toHaveClass('shimmer-container');
  });

  it('matches snapshot', () => {
    const { asFragment } = render(<Shimmer />);
    expect(asFragment()).toMatchSnapshot();
  });
});