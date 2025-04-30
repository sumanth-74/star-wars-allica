import React, { useEffect, useState, useMemo } from 'react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchCharacters, fetchCharacter, fetchPlanet } from '../../services/api';
import { useError } from '../../contexts/ErrorContext';
import Shimmer from '../Shimmer/Shimmer';
import Pagination from '../Pagination/Pagination';
import SearchBar from '../SearchBar/SearchBar';
import './CharacterList.css';

const CharacterList = () => {
  const { showError } = useError();
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [search, setSearch] = useState('');
  const [characterList, setCharacterList] = useState([]);
  const [planetCache, setPlanetCache] = useState({}); // Cache for planet names

  // Fetch character list (normal or search)
  const { data, isLoading: isFetchingCharacters, error } = useQuery({
    queryKey: ['characters', page, limit, search],
    queryFn: () => fetchCharacters(page, limit, search),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch planet name with caching
  const fetchPlanetWithCache = async (url) => {
    if (planetCache[url]) {
      return planetCache[url];
    }
    const planetDetails = await fetchPlanet(url);
    const planetName = planetDetails.result.properties.name || 'unknown';
    setPlanetCache((prev) => ({ ...prev, [url]: planetName }));
    return planetName;
  };

  // Process the response based on whether it's a search or normal paginated response
  useEffect(() => {
    const processCharacters = async () => {
      if (data) {
        if (search && data.result) {
          // Handle search response
          const mappedCharacters = await Promise.all(
            data.result.map(async (char) => {
              const homeworldName = char.properties.homeworld
                ? await fetchPlanetWithCache(char.properties.homeworld)
                : 'unknown';
              return {
                ...char.properties,
                uid: char.uid,
                description: char.description,
                homeworld: homeworldName,
              };
            })
          );
          setCharacterList(mappedCharacters);
        } else if (!search && data.results) {
          // Handle normal paginated response
          const normalizedCharacters = data.results.map((char) => ({
            url: char.url,
            uid: char.uid,
            name: char.name,
          }));
          setCharacterList(normalizedCharacters);
        }
      }
    };

    processCharacters();
  }, [data, search]);

  // Fetch character details for normal response
  const characterQueries = useQueries({
    queries: characterList.map((char) => ({
      queryKey: ['character', char.uid],
      queryFn: () => fetchCharacter(char.uid),
      staleTime: Infinity,
      enabled: !!char.uid && !search, // Only fetch for normal response
    })),
  });

  // Extract unique homeworld URLs from character details
  const homeworldUrls = useMemo(() => {
    if (search) return []; // Skip for search response
    const urls = characterQueries
      .map((query) => query.data?.result.properties.homeworld)
      .filter(Boolean);
    return Array.from(new Set(urls));
  }, [characterQueries, search]);

  // Fetch planet details for unique homeworld URLs
  const planetQueries = useQueries({
    queries: homeworldUrls.map((homeworldUrl) => ({
      queryKey: ['planet', homeworldUrl],
      queryFn: async () => {
        const planetDetails = await fetchPlanet(homeworldUrl);
        return {
          url: homeworldUrl,
          name: planetDetails.result.properties.name || 'unknown',
        };
      },
      staleTime: Infinity,
      enabled: !!homeworldUrl,
    })),
  });

  // Combine character and homeworld data for normal response
  const combinedCharacterList = useMemo(() => {
    if (search) {
      // For search response, use the characterList directly
      return characterList;
    }

    // For normal response, combine character and homeworld data
    return characterQueries
      .map((query, index) => {
        const charData = characterList[index];
        if (!query.data || !charData) return null;

        const properties = query.data.result.properties;
        const homeworldUrl = properties.homeworld;
        const planetQuery = planetQueries.find((q) => q.data?.url === homeworldUrl);
        const homeworldName = planetQuery?.data?.name || 'unknown';

        return {
          ...properties,
          uid: charData.uid,
          homeworld: homeworldName,
          url: charData.url,
        };
      })
      .filter((char) => char);
  }, [characterQueries, planetQueries, characterList, search]);

  useEffect(() => {
    if (error) {
      showError('Failed to load characters. Please try again later.');
    }
  }, [error, showError]);

  const handleSearchClick = (searchInput) => {
    setSearch(searchInput);
    setPage(1); // Reset to the first page when searching
  };

  const handleBackClick = () => {
    setSearch(''); // Clear the search input
    setPage(1); // Reset to the first page
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  if (
    isFetchingCharacters ||
    (!search && characterQueries.some((query) => query.isLoading)) ||
    (!search && planetQueries.some((query) => query.isLoading))
  ) {
    return (
      <div className="container">
        <h1 className="title">Star Wars Characters</h1>
        <Shimmer count={12} />
      </div>
    );
  }

  if (error) return <div>Error loading characters</div>;

  return (
    <div className="container">
      <h1 className="title">Star Wars Characters</h1>
      <SearchBar onSearch={handleSearchClick} />
      <div className="character-list">
        {combinedCharacterList.length > 0 ? (
          combinedCharacterList.map((char) => (
            <Link key={char.uid} to={`/character/${char.uid}`} className="character-card">
              <h3 className="character-name">{char.name}</h3>
              <p className="character-detail">Gender: {char.gender || 'unknown'}</p>
              <p className="character-detail">Homeworld: {char.homeworld || 'unknown'}</p>
            </Link>
          ))
        ) : (
          <div className="no-results-container">
            <p className="no-results">No characters found.</p>
            <button onClick={handleBackClick} className="back-button">
              Back
            </button>
          </div>
        )}
      </div>
      {!search && (
        <Pagination
          currentPage={page}
          totalPages={search ? 1 : data?.total_pages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default CharacterList;

