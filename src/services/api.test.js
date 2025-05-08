global.fetch = jest.fn();

import { fetchCharacters } from './api';

describe('fetchCharacters', () => {
  it('fetches characters successfully', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        results: [
          { name: 'Luke Skywalker', height: '172', gender: 'male' },
          { name: 'Darth Vader', height: '202', gender: 'male' },
        ],
      }),
    });

    const result = await fetchCharacters(1, 10);
    expect(result.results).toHaveLength(2);
    expect(result.results[0].name).toBe('Luke Skywalker');
  });

  it('handles API error for fetchCharacters', async () => {
    fetch.mockResolvedValueOnce({
      ok: false,
    });

    await expect(fetchCharacters(1, 10, '')).rejects.toThrow('Failed to fetch characters');
  });
});
