import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchCharacters, fetchCharacter, fetchPlanet } from '../services/api';
import Shimmer from './Shimmer'; // Import Shimmer component
import '../App.css'; // Import styles

const CharacterList = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10); // Default limit of 10 items per page
  const [search, setSearch] = useState('');
  const [characters, setCharacters] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false); // Track loading state for details and planet APIs

  const { data, isLoading, error } = useQuery({
    queryKey: ['characters', page, limit, search],
    queryFn: () => fetchCharacters(page, limit, search),
    keepPreviousData: true, // Keep previous data while fetching new data
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
  });

  useEffect(() => {
    const fetchCharacterDetails = async () => {
      if (data?.results) {
        setLoadingDetails(true); // Start loading details
        const detailedCharacters = await Promise.all(
          data.results.map(async (char) => {
            try {
              // Extract charId from char.url
              const charId = char.url.split('/').filter(Boolean).pop();

              const details = await fetchCharacter(charId); // Fetch character details
              const homeworldDetails = await fetchPlanet(details.result.properties.homeworld); // Fetch homeworld details
              return {
                uid: char.uid, // Use uid as the unique identifier
                name: char.name,
                gender: details.result.properties.gender,
                homeworld: homeworldDetails.result.properties.name, // Extract planet name
                url: char.url, // Pass the URL for consistent navigation
              };
            } catch (error) {
              console.error(`Failed to fetch details for ${char.name}:`, error);
              return null; // Skip this character if fetching fails
            }
          })
        );
        setCharacters(detailedCharacters.filter((char) => char !== null)); // Filter out failed fetches
        setLoadingDetails(false); // Stop loading details
      }
    };

    fetchCharacterDetails();
  }, [data]);

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

  // Show shimmer UI if either the characters API or details/planet APIs are still loading
  if (isLoading || loadingDetails) {
    return (
      <div className="container">
        <h1 className="title">Star Wars Characters</h1>
        <Shimmer count={10} type="card" /> {/* Show shimmer UI */}
      </div>
    );
  }

  if (error) return <div>Error loading characters</div>;

  return (
    <div className="container">
      <h1 className="title">Star Wars Characters</h1>
      <SearchBar onSearch={handleSearchClick} />
      <div className="character-list">
        {characters.map((char) => (
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