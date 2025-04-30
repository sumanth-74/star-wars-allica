i mport React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import Button from './Button';
import { fetchCharacters } from '../services/api';
import { transformSearchResults, transformCharacterResults } from '../services/characterService';
import '../App.css'; // Import styles

const CharacterList = () => {
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [characters, setCharacters] = useState([]);
  const { data, isLoading, error } = useQuery({
    queryKey: ['characters', page, search],
    queryFn: () => fetchCharacters(page, search),
    keepPreviousData: true, // Keep previous data while fetching new data
  });

  useEffect(() => {
    const fetchCharacterDetails = async () => {
      console.log('API response data:', data); // Debug API response
      if (data?.result && Array.isArray(data.result)) {
        // Handle search API response
        try {
          const detailedCharacters = await transformSearchResults(data.result);
          console.log('Detailed characters from search API:', detailedCharacters);
          setCharacters(detailedCharacters);
        } catch (error) {
          console.error('Error transforming search results:', error);
        }
      } else if (data?.results && Array.isArray(data.results)) {
        // Handle fetch characters API response
        try {
          const detailedCharacters = await transformCharacterResults(data.results);
          console.log('Detailed characters from fetch characters API:', detailedCharacters);
          setCharacters(detailedCharacters);
        } catch (error) {
          console.error('Error transforming character results:', error);
        }
      } else {
        console.log('No results found in API response.');
        setCharacters([]); // Clear characters if no results
      }
    };

    fetchCharacterDetails();
  }, [data]);

  const handleSearchClick = () => {
    console.log('Search triggered with input:', searchInput);
    setSearch(searchInput); // Trigger search with the input value
    setPage(1); // Reset to the first page when searching
  };

  const handleNextPage = () => {
    console.log('Next page triggered.');
    if (data?.next) setPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    console.log('Previous page triggered.');
    if (data?.previous) setPage((prev) => prev - 1);
  };

  if (isLoading) {
    console.log('Loading data...');
    return <div>Loading...</div>;
  }
  if (error) {
    console.error('Error loading data:', error);
    return <div>Error loading characters</div>;
  }

  return (
    <div className="container">
      <h1 className="title">Star Wars Characters</h1>
      <div className="search-container">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name..."
          className="search-input"
        />
        <button onClick={handleSearchClick} className="search-button">
          Search
        </button>
      </div>
      <div className="character-list">
        {characters.length > 0 ? (
          characters.map((char) => (
            <Link key={char.uid} to={`/character/${char.uid}`} className="character-card">
              <h3 className="character-name">{char.name}</h3>
              <p className="character-detail">Gender: {char.gender}</p>
              <p className="character-detail">Homeworld: {char.homeworld}</p>
            </Link>
          ))
        ) : (
          <p className="no-results">No characters found.</p>
        )}
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

export default CharacterList;


==========

import { fetchCharacter, fetchPlanet } from './api';

export const transformSearchResults = async (searchResults) => {
  return Promise.all(
    searchResults.map(async (char) => {
      const homeworldDetails = await fetchPlanet(char.properties.homeworld); // Fetch homeworld details
      return {
        uid: char.properties.uid,
        name: char.properties.name,
        gender: char.properties.gender,
        homeworld: homeworldDetails.result.properties.name, // Extract planet name
      };
    })
  );
};

export const transformCharacterResults = async (characterResults) => {
  return Promise.all(
    characterResults.map(async (char) => {
      const details = await fetchCharacter(char.uid); // Fetch character details
      const homeworldDetails = await fetchPlanet(details.result.properties.homeworld); // Fetch homeworld details
      return {
        uid: char.uid,
        name: char.name,
        gender: details.result.properties.gender,
        homeworld: homeworldDetails.result.properties.name, // Extract planet name
      };
    })
  );
};
