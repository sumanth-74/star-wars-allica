export interface CharacterProperties {
  name: string;
  height: string;
  gender: string;
  homeworld: string;
  mass?: string;
  hair_color?: string;
  skin_color?: string;
  eye_color?: string;
  birth_year?: string;
  created?: string;
  edited?: string;
  url: string;
  [key: string]: string | undefined;
}

export interface CharacterResponse {
  message: string;
  result: {
    properties: CharacterProperties;
    description: string;
    uid: string;
  };
}

export interface PlanetResponse {
  message: string;
  result: {
    properties: {
      name: string;
      [key: string]: string | undefined;
    };
  };
}

export interface PaginatedCharacter {
  uid: string;
  name: string;
  url: string;
}

export interface CharactersResponse {
  message: string;
  total_records?: number;
  total_pages?: number;
  previous?: string | null;
  next?: string | null;
  results?: PaginatedCharacter[];
  result?: PaginatedCharacter[];
}

export const fetchCharacter = async (uid: string): Promise<CharacterResponse> => {
  const response = await fetch(`https://www.swapi.tech/api/people/${uid}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch character ${uid}`);
  }
  return response.json();
};

export const fetchPlanet = async (url: string): Promise<PlanetResponse> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch planet ${url}`);
  }
  return response.json();
};

export const fetchCharacters = async (
  page: number,
  limit: number,
  search?: string
): Promise<CharactersResponse> => {
  const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
  if (search) params.append('name', search);
  const response = await fetch(`https://www.swapi.tech/api/people?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch characters');
  }
  return response.json();
};