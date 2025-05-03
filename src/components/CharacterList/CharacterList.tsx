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
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(12);
  const [search, setSearch] = useState<string>('');
  const [characterList, setCharacterList] = useState<NormalizedCharacter[]>([]);
  const [planetCache, setPlanetCache] = useState<Record<string, string>>({});

  // Fetch character list (normal or search)
  const { data, isLoading: isFetchingCharacters, error } = useQuery<CharactersResponse, Error>({
    queryKey: ['characters', page, limit, search],
    queryFn: () => fetchCharacters(page, limit, search),
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
        if (search && data.result) {
          // Handle search response
          const mappedCharacters = await Promise.all(
            data.result.map(async (char: PaginatedCharacter): Promise<NormalizedCharacter> => {
              const characterDetails: CharacterResponse = await fetchCharacter(char.uid);
              const properties = characterDetails.result.properties;
              const homeworldName = properties.homeworld
                ? await fetchPlanetWithCache(properties.homeworld)
                : 'unknown';
              return {
                ...properties,
                uid: char.uid,
                homeworld: homeworldName,
              };
            })
          );
          setCharacterList(mappedCharacters);
        } else if (!search && data.results) {
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
      }
    };

    processCharacters();
  }, [data, search]);

  // Fetch character details for normal response
  const characterQueries: UseQueryResult<CharacterResponse, Error>[] = useQueries({
    queries: characterList.map((char: NormalizedCharacter) => ({
      queryKey: ['character', char.uid],
      queryFn: () => fetchCharacter(char.uid),
      staleTime: Infinity,
      enabled: !!char.uid && !search,
    })),
  });

  // Extract unique homeworld URLs from character details
  const homeworldUrls = useMemo<string[]>(() => {
    if (search) return [];
    const urls = characterQueries
      .map((query) => query.data?.result.properties.homeworld)
      .filter((url): url is string => !!url);
    return Array.from(new Set(urls));
  }, [characterQueries, search]);

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
    if (search) {
      return characterList;
    }

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
  }, [characterQueries, planetQueries, characterList, search]);

  useEffect(() => {
    if (error) {
      showError('Failed to load characters. Please try again later.');
    }
  }, [error, showError]);

  const handleSearchClick = (searchInput: string): void => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleBackClick = (): void => {
    setSearch('');
    setPage(1);
  };

  const handlePageChange = (newPage: number): void => {
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
          {search && (
            <div className="back-button-container">
              <button onClick={handleBackClick} className="back-button">
                Back
              </button>
            </div>
          )}
          {!search && (
            <Pagination
              currentPage={page}
              totalPages={search ? 1 : data?.total_pages ?? 1}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}
    </div>
  );
};

export default CharacterList;