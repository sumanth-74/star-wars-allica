import axios from 'axios';

const api = axios.create({
  baseURL: 'https://swapi.tech/api',
  timeout: 10000, // Set a timeout for requests
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export const fetchCharacters = async (page, limit = 10, search = '') => {
  const searchParam = search ? `&name=${encodeURIComponent(search)}` : '';
  const response = await api.get(`/people/?page=${page}&limit=${limit}${searchParam}`);
  return response.data;
};

export const fetchCharacter = async (charId) => {
  const response = await api.get(`/people/${charId}`);
  return response.data;
};

export const fetchPlanet = async (planetUrl) => {
  const response = await axios.get(planetUrl); // Use axios directly for external URLs
  return response.data;
};