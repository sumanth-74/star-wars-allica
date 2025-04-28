import { fetchCharacters } from './api';
import axios from 'axios';

jest.mock('axios');

test('handles API error for fetchCharacters', async () => {
  axios.get.mockRejectedValueOnce(new Error('Network Error'));

  await expect(fetchCharacters(1, 10, '')).rejects.toThrow('Network Error');
});
