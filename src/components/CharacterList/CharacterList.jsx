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

  // Fetch character list
  const { data, isLoading: isFetchingCharacters, error } = useQuery({
    queryKey: ['characters', page, limit, search],
    queryFn: () => fetchCharacters(page, limit, search),
    keepPreviousData: true,
    staleTime: 5 * 60 * 1000,
  });

  // Normalize character data
  const normalizeCharacterData = (char) => ({
    url: char.url,
    uid: char.uid,
    name: char.name,
  });

  // Get character data for the current page
  const characterData = (data?.results || []).map(normalizeCharacterData);

  // Fetch character details
  const characterQueries = useQueries({
    queries: characterData.map((char) => ({
      queryKey: ['character', char.uid],
      queryFn: () => fetchCharacter(char.uid),
      staleTime: Infinity,
      enabled: !!char.uid,
    })),
  });

  // Extract unique homeworld URLs from character details
  const homeworldUrls = useMemo(() => {
    const urls = characterQueries
      .map((query) => query.data?.result.properties.homeworld)
      .filter(Boolean);
    return Array.from(new Set(urls));
  }, [characterQueries]);

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

  // Combine character and homeworld data
  const characterList = useMemo(() => {
    return characterQueries
      .map((query, index) => {
        const charData = characterData[index];
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
  }, [characterQueries, planetQueries, characterData]);

  useEffect(() => {
    if (error) {
      showError('Failed to load characters. Please try again later.');
    }
  }, [error, showError]);

  const handleSearchClick = (searchInput) => {
    setSearch(searchInput);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  if (
    isFetchingCharacters ||
    characterQueries.some((query) => query.isLoading) ||
    planetQueries.some((query) => query.isLoading)
  ) {
    return (
      <div className="container">
        <h1 className="title">Star Wars Characters</h1>
        <Shimmer count={12} />
      </div>
    );
  }

  if (error) return <div>Error loading characters</div>;

  const totalPages = data?.total_pages || Math.ceil(data?.total_records / limit) || 1;

  return (
    <div className="container">
      <h1 className="title">Star Wars Characters</h1>
      <SearchBar onSearch={handleSearchClick} />
      <div className="character-list">
        {characterList.length > 0 ? (
          characterList.map((char) => (
            <Link key={char.uid} to={`/character/${char.uid}`} className="character-card">
              <h3 className="character-name">{char.name}</h3>
              <p className="character-detail">Gender: {char.gender || 'unknown'}</p>
              <p className="character-detail">Homeworld: {char.homeworld || 'unknown'}</p>
            </Link>
          ))
        ) : (
          <p className="no-results">No characters found.</p>
        )}
      </div>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default CharacterList;