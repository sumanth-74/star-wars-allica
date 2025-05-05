import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import CharacterList from './components/CharacterList/CharacterList';
import CharacterDetails from './components/CharacterDetails/CharacterDetails';
import Favorites from './components/Favorites/Favorites';
import Navbar from './components/Navbar/Navbar';
import FavoritesProvider from './contexts/FavoritesContext';
import { ErrorProvider } from './contexts/ErrorContext';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import { SearchProvider } from './contexts/SearchContext';

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <SearchProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ErrorProvider>
            <FavoritesProvider>
              <Router>
                <Navbar />
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
    </SearchProvider>
  );
};

export default App;
