import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FaEdit } from 'react-icons/fa'; // Import edit icon
import { fetchCharacter, fetchPlanet } from '../services/api';
import { useFavorites } from '../contexts/FavoritesContext';
import '../App.css'; // Import styles

const CharacterDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient(); // Access react-query's query client
  const { updateCharacter, addFavorite, favorites } = useFavorites();

  const [editingField, setEditingField] = useState(null);
  const [fieldValue, setFieldValue] = useState('');

  const { data: character, isLoading: isCharacterLoading } = useQuery({
    queryKey: ['character', id],
    queryFn: () => fetchCharacter(id),
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
  });

  const { data: homeworld, isLoading: isHomeworldLoading } = useQuery({
    queryKey: ['planet', character?.result.properties.homeworld],
    queryFn: () => fetchPlanet(character?.result.properties.homeworld),
    enabled: !!character?.result.properties.homeworld,
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes
  });

  const isFavorite = favorites.some((fav) => fav.url === `https://swapi.tech/api/people/${id}`);

  const handleEdit = (field) => {
    setEditingField(field);
    setFieldValue(character?.result.properties[field] || ''); // Ensure the input is always controlled
  };

  const handleSave = () => {
    const updatedCharacter = {
      ...character.result.properties,
      [editingField]: fieldValue,
    };

    // Update the global state
    updateCharacter(`https://swapi.tech/api/people/${id}`, { [editingField]: fieldValue });

    // Update the react-query cache
    queryClient.setQueryData(['character', id], (prev) => ({
      ...prev,
      result: {
        ...prev.result,
        properties: updatedCharacter,
      },
    }));

    setEditingField(null); // Exit editing mode
  };

  if (isCharacterLoading || isHomeworldLoading) return <div>Loading...</div>;
  if (!character) return <div>Error loading character details</div>;

  const properties = character.result.properties;

  return (
    <div className="character-details-container">
      <div className="character-details-header">
        <h1>{properties.name}</h1>
        <button onClick={() => navigate(-1)} className="back-button">Back</button>
      </div>
      <div className="character-details-section">
        <h2>Basic Information</h2>
        <div className="character-detail">
          <span>Height: </span>
          {editingField === 'height' ? (
            <input
              type="text"
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              className="edit-input"
            />
          ) : (
            <span>{properties.height || 'unknown'}</span>
          )}
          <FaEdit
            className="edit-icon"
            onClick={() => handleEdit('height')}
            title="Edit Height"
          />
        </div>
        <div className="character-detail">
          <span>Gender: </span>
          {editingField === 'gender' ? (
            <input
              type="text"
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
              className="edit-input"
            />
          ) : (
            <span>{properties.gender || 'unknown'}</span>
          )}
          <FaEdit
            className="edit-icon"
            onClick={() => handleEdit('gender')}
            title="Edit Gender"
          />
        </div>
        <p>Homeworld: {homeworld?.result.properties.name || 'unknown'}</p>
      </div>
      <div className="add-to-favorites-container">
        <button
          onClick={() => addFavorite({ ...properties, url: `https://swapi.tech/api/people/${id}` })}
          disabled={isFavorite}
          className="add-to-favorites-button"
        >
          {isFavorite ? 'Already in Favorites' : 'Add to Favorites'}
        </button>
      </div>
      {editingField && (
        <div className="edit-actions">
          <button onClick={handleSave} className="save-button">Save</button>
          <button onClick={() => setEditingField(null)} className="cancel-button">Cancel</button>
        </div>
      )}
    </div>
  );
};

export default CharacterDetails;