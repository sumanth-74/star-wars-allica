import React from 'react';
import { render } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';

const ProblematicComponent = () => {
  throw new Error('Test Error');
};

test('renders fallback UI on error', () => {
  const { getByText } = render(
    <ErrorBoundary>
      <ProblematicComponent />
    </ErrorBoundary>
  );

  expect(getByText(/Something went wrong/i)).toBeInTheDocument();
});
