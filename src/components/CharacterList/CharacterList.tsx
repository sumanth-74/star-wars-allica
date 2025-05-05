import React, { useEffect, useState, useMemo } from 'react';
import { useQuery, useQueries, UseQueryResult, keepPreviousData } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  fetchCharacters,
  fetchCharacter,
  fetchPlanet,
  CharactersResponse,
  CharacterResponse,
  PlanetResponse,
  PaginatedCharacter,
  CharacterProperties,
} from '../../services/api';
import { useError } from '../../contexts/ErrorContext';
import { useSearch } from '../../contexts/SearchContext';
import Shimmer from '../Shimmer/Shimmer';
import Pagination from '../Pagination/Pagination';
import SearchBar from '../SearchBar/SearchBar';
import './CharacterList.css';

// Define character data for the component
interface NormalizedCharacter {
  uid: string;
  name: string;
  url: string;
  gender?: string;
  homeworld?: string;
  description?: string;
  height?: string;
  mass?: string;
  hair_color?: string;
  skin_color?: string;
  eye_color?: string;
  birth_year?: string;
  created?: string;
  edited?: string;
}

// Define planet data
interface PlanetData {
  url: string;
  name: string;
}

// ErrorContext type
interface ErrorContextType {
  showError: (message: string) => void;
}

// Component
const CharacterList: React.FC = () => {
  const { showError } = useError() as ErrorContextType;
  const { searchQuery, setSearchQuery } = useSearch();
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(12);
  const [characterList, setCharacterList] = useState<NormalizedCharacter[]>([]);
  const [planetCache, setPlanetCache] = useState<Record<string, string>>({});

  // Fetch character list (normal or search)
  const { data, isLoading: isFetchingCharacters, error } = useQuery<CharactersResponse, Error>({
    queryKey: ['characters', page, limit, searchQuery],
    queryFn: () => fetchCharacters(page, limit, searchQuery),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch planet name with caching
  const fetchPlanetWithCache = async (url: string): Promise<string> => {
    if (planetCache[url]) {
      return planetCache[url];
    }
    const planetDetails: PlanetResponse = await fetchPlanet(url);
    const planetName = planetDetails.result.properties.name || 'unknown';
    setPlanetCache((prev) => ({ ...prev, [url]: planetName }));
    return planetName;
  };

  // Process the response based on whether it's a search or normal paginated response
  useEffect(() => {
    const processCharacters = async () => {
      if (data) {
        if (data.results) {
          // Handle normal paginated response
          const normalizedCharacters: NormalizedCharacter[] = data.results.map(
            (char: PaginatedCharacter) => ({
              url: char.url,
              uid: char.uid,
              name: char.name,
            })
          );
          setCharacterList(normalizedCharacters);
        }
        if (data.result) {
          // Handle search response
          const normalizedCharacters: NormalizedCharacter[] = data.result.map((char: any) => ({
            uid: char.properties.uid || char.uid,
            name: char.properties.name,
            url: char.properties.url || char.url,
            gender: char.properties.gender,
            homeworld: char.properties.homeworld,
          }));
          setCharacterList(normalizedCharacters);
        }
      }
    };

    processCharacters();
  }, [data]);

  // Fetch character details for normal response
  const characterQueries: UseQueryResult<CharacterResponse, Error>[] = useQueries({
    queries: characterList.map((char: NormalizedCharacter) => ({
      queryKey: ['character', char.uid],
      queryFn: () => fetchCharacter(char.uid),
      staleTime: Infinity,
      enabled: !!char.uid,
    })),
  });

  // Extract unique homeworld URLs from character details
  const homeworldUrls = useMemo<string[]>(() => {
    const urls = characterQueries
      .map((query) => query.data?.result.properties.homeworld)
      .filter((url): url is string => !!url);
    return Array.from(new Set(urls));
  }, [characterQueries]);

  // Fetch planet details for unique homeworld URLs
  const planetQueries: UseQueryResult<PlanetData, Error>[] = useQueries({
    queries: homeworldUrls.map((homeworldUrl: string) => ({
      queryKey: ['planet', homeworldUrl],
      queryFn: async () => {
        const planetDetails: PlanetResponse = await fetchPlanet(homeworldUrl);
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
    return characterQueries
      .map((query, index) => {
        const charData = characterList[index];
        if (!query.data || !charData) return null;

        const properties: CharacterProperties = query.data.result.properties;
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
      .filter((char) => char !== null);
  }, [characterQueries, planetQueries, characterList]);

  useEffect(() => {
    if (error) {
      showError('Failed to load characters. Please try again later.');
    }
  }, [error, showError]);

  const handlePageChange = (newPage: number): void => {
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
  if (combinedCharacterList.length === 0) {
    return (
      <div className="no-results-container">
        <p className="no-results">No characters found.</p>
        <div className="back-button-container">
          <button className="back-button" onClick={() => setSearchQuery('')}>
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="title">Star Wars Characters</h1>
      <SearchBar />
      {isFetchingCharacters ? (
        <div className="shimmer-container">
          <Shimmer count={12} />
        </div>
      ) : (
        <>
          <div className="character-list">
            {combinedCharacterList.length > 0 ? (
              combinedCharacterList.map((char) => (
                char && (
                  <Link key={char.uid} to={`/character/${char.uid}`} className="character-card">
                    <h3 className="character-name">{char.name}</h3>
                    <p className="character-detail">Gender: {char.gender || 'unknown'}</p>
                    <p className="character-detail">Homeworld: {char.homeworld || 'unknown'}</p>
                  </Link>
                )
              ))
            ) : (
              <div className="no-results-container">
                <p className="no-results">No characters found.</p>
              </div>
            )}
          </div>
          {searchQuery && (
            <div className="back-button-container">
              <button className="back-button" onClick={() => setSearchQuery('')}>
                Back
              </button>
            </div>
          )}
          <Pagination
            currentPage={page}
            totalPages={data?.total_pages ?? 1}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default CharacterList;