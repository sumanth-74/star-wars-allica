import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchCharacters } from '../services/api';
import { useFavorites } from '../contexts/FavoritesContext';
import Shimmer from './Shimmer'; // Import Shimmer component
import '../App.css'; // Import styles

const CharacterList = () => {
  const { characters, fetchAndCacheCharacter } = useFavorites();
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Default limit of 10 items per page
  const [search, setSearch] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['characters', page, limit, search],
    queryFn: () => fetchCharacters(page, limit, search),
    keepPreviousData: true, // Keep previous data while fetching new data
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
  });

  useEffect(() => {
    const fetchAllDetails = async () => {
      if (data?.results) {
        await Promise.all(
          data.results.map(async (char) => {
            if (!char.url) {
              console.error('Invalid character URL:', char);
              return;
            }
            await fetchAndCacheCharacter(char.url); // Fetch and cache character and planet details
          })
        );
      }
    };

    fetchAllDetails();
  }, [data, fetchAndCacheCharacter]);

  const handleSearchClick = (searchInput) => {
    setSearch(searchInput); // Trigger search with the input value
    setPage(1); // Reset to the first page when searching
  };

  const handleNextPage = () => {
    if (data?.next) {
      setPage((prev) => prev + 1); // Increment the page number
    }
  };

  const handlePreviousPage = () => {
    if (data?.previous) {
      setPage((prev) => prev - 1); // Decrement the page number
    }
  };

  if (isLoading) {
    return (
      <div className="container">
        <h1 className="title">Star Wars Characters</h1>
        <Shimmer count={10} type="card" /> {/* Show shimmer UI */}
      </div>
    );
  }

  if (error) return <div>Error loading characters</div>;

  const characterUrls = data?.results.map((char) => char.url) || [];
  const characterList = characterUrls.map((url) => characters[url]).filter(Boolean);

  return (
    <div className="container">
      <h1 className="title">Star Wars Characters</h1>
      <SearchBar onSearch={handleSearchClick} />
      <div className="character-list">
        {characterList.map((char) => (
          <Link key={char.uid} to={`/character/${char.uid}`} className="character-card">
            <h3 className="character-name">{char.name}</h3>
            <p className="character-detail">Gender: {char.gender || 'unknown'}</p>
            <p className="character-detail">Homeworld: {char.homeworld || 'unknown'}</p>
          </Link>
        ))}
      </div>
      <div className="pagination-container">
        <button
          onClick={handlePreviousPage}
          disabled={!data?.previous}
          className="pagination-button"
        >
          Previous
        </button>
        <button
          onClick={handleNextPage}
          disabled={!data?.next}
          className="pagination-button"
        >
          Next
        </button>
      </div>
    </div>
  );
};

const SearchBar = ({ onSearch }) => {
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = () => {
    onSearch(searchInput);
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
    </div>
  );
};

export default CharacterList;