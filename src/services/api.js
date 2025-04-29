export const fetchCharacter = async (uid) => {
  const response = await fetch(`https://www.swapi.tech/api/people/${uid}`);
  console.log('response', response);
  if (!response.ok) {
    throw new Error(`Failed to fetch character ${uid}: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  if (!data.result) {
    throw new Error(`Invalid response for character ${uid}: Missing result`);
  }
  return data;
};

export const fetchPlanet = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch planet ${url}: ${response.status} ${response.statusText}`);
  }
  const data = await response.json();
  if (!data.result) {
    throw new Error(`Invalid response for planet ${url}: Missing result`);
  }
  return data;
};

export const fetchCharacters = async (page, limit, search) => {
  const params = new URLSearchParams({ page, limit });
  if (search) params.append('name', search);
  const response = await fetch(`https://www.swapi.tech/api/people?${params}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch characters: ${response.status} ${response.statusText}`);
  }
  return response.json();
};