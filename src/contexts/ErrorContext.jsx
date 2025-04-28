import React, { createContext, useContext, useState } from 'react';

const ErrorContext = createContext();

export const useError = () => useContext(ErrorContext);

export const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);

  const showError = (message) => {
    setError(message);
  };

  return (
    <ErrorContext.Provider value={{ error, showError }}>
      {children}
      {error && <div className="error-banner">{error}</div>}
    </ErrorContext.Provider>
  );
};
