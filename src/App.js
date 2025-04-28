import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CharacterList from './components/CharacterList/CharacterList'; // Updated path
import CharacterDetails from './components/CharacterDetails/CharacterDetails'; // Updated path
import Favorites from './components/Favorites/Favorites'; // Updated path
import Navbar from './components/Navbar/Navbar'; // Updated path
import FavoritesProvider from './contexts/FavoritesContext'; // Updated path
import { ErrorProvider } from './contexts/ErrorContext'; // Import ErrorProvider
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary'; // Import ErrorBoundary

const queryClient = new QueryClient();

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ErrorProvider>
          <FavoritesProvider>
            <Router>
              <Navbar /> {/* Use Navbar component */}
              <Routes>
                <Route path="/" element={<CharacterList />} />
                <Route path="/character/:id" element={<CharacterDetails />} />
                <Route path="/favorites" element={<Favorites />} />
              </Routes>
            </Router>
          </FavoritesProvider>
        </ErrorProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;