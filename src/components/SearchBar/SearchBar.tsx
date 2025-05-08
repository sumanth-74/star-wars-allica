import React, { useState, useEffect } from 'react';
import './SearchBar.css';
import { fetchCharacters } from '../../services/api';
import { useSearch } from '../../contexts/SearchContext';

const SearchBar: React.FC = () => {
  const { setSearchQuery } = useSearch();
  const [searchInput, setSearchInput] = useState<string>('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [debounceTimeout, setDebounceTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [cache, setCache] = useState<{ [key: string]: string[] }>({});

  useEffect(() => {
    if (searchInput.trim() === '') {
      setSuggestions([]);
      return;
    }

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(async () => {
      const cachedResults = Object.keys(cache).find((key) => searchInput.startsWith(key));
      if (cachedResults) {
        setSuggestions(cache[cachedResults]);
      } else {
        try {
          const response = await fetchCharacters(1, 5, searchInput);
          const names = response.result?.map((char) => char.properties.name) || [];
          setCache((prevCache) => ({ ...prevCache, [searchInput]: names }));
          setSuggestions(names);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
        }
      }
    }, 1000); // 1000ms debounce

    setDebounceTimeout(timeout);
  }, [searchInput, cache]);

  const handleSearch = () => {
    setSearchQuery(searchInput); // Update the search query in context
    setSearchInput(''); // Clear the search input after search
    setSuggestions([]); // Clear suggestions
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion); // Update the search query in context
    setSuggestions([]); // Clear suggestions after updating the context
  };

  return (
    <div className="search-container">
      <input
        type="text"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search by name..."
        className="search-input"
      />
      <button onClick={handleSearch} className="search-button">
        Search
      </button>
      {suggestions.length > 0 && (
        <ul className="suggestions-list">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="suggestion-item"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
