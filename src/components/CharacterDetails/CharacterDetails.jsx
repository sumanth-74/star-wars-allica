import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa';
import { useFavorites } from '../../contexts/FavoritesContext';
import { fetchCharacter, fetchPlanet } from '../../services/api';
import './CharacterDetails.css';

const CharacterDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { updateCharacter, addFavorite, favorites } = useFavorites();

  const characterUrl = `https://www.swapi.tech/api/people/${id}`;
  const isFavorite = favorites.some((fav) => fav.url === characterUrl);

  const [editingField, setEditingField] = React.useState(null);
  const [fieldValue, setFieldValue] = React.useState('');

  // Fetch character details
  const { data: characterDetails, isLoading: isLoadingCharacter } = useQuery({
    queryKey: ['character', id],
    queryFn: () => fetchCharacter(id),
    staleTime: Infinity,
  });

  // Fetch homeworld details if available
  const homeworldUrl = characterDetails?.result.properties.homeworld;
  const { data: planet, isLoading: isLoadingPlanet } = useQuery({
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
  });

  // Combine character and homeworld data
  const character = characterDetails
    ? {
        ...characterDetails.result.properties,
        uid: id,
        homeworld: planet?.name || 'unknown',
        url: characterUrl,
      }
    : null;

  const handleEdit = (field) => {
    setEditingField(field);
    setFieldValue(character[field] || '');
  };

  const handleSave = () => {
    updateCharacter(queryClient, character.url, { [editingField]: fieldValue });
    setEditingField(null);
  };

  const handleCancel = () => {
    setEditingField(null);
  };

  if (isLoadingCharacter || isLoadingPlanet) return <div>Loading character details...</div>;
  if (!character) return <div>Character details not found.</div>;

  const renderCharacterAttributes = () => {
    const attributes = Object.entries(character).filter(
      ([key]) => !['url', 'uid', 'name', 'height', 'gender', 'homeworld'].includes(key)
    );

    return attributes.map(([key, value]) => (
      <div key={key} className="character-attribute">
        <span className="attribute-key">{key.replace('_', ' ')}:</span>
        <span className="attribute-value">{value || 'unknown'}</span>
      </div>
    ));
  };

  return (
    <div className="character-details-container">
      <div className="character-details-header">
        <h1>{character.name}</h1>
        <button onClick={() => navigate(-1)} className="back-button">
          Back
        </button>
      </div>
      <div className="character-details-section">
        <h2>Basic Information</h2>
        <div className="editable-attribute">
          <span className="attribute-key">Height:</span>
          <div className="editable-field">
            {editingField === 'height' ? (
              <>
                <input
                  type="text"
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  className="edit-input"
                />
                <FaSave
                  className="save-icon"
                  onClick={handleSave}
                  title="Save Height"
                />
                <FaTimes
                  className="cancel-icon"
                  onClick={handleCancel}
                  title="Cancel Edit"
                />
              </>
            ) : (
              <>
                <span className="attribute-value">{character.height || 'unknown'}</span>
                <FaEdit
                  className="edit-icon"
                  onClick={() => handleEdit('height')}
                  title="Edit Height"
                />
              </>
            )}
          </div>
        </div>
        <div className="editable-attribute">
          <span className="attribute-key">Gender:</span>
          <div className="editable-field">
            {editingField === 'gender' ? (
              <>
                <input
                  type="text"
                  value={fieldValue}
                  onChange={(e) => setFieldValue(e.target.value)}
                  className="edit-input"
                />
                <FaSave
                  className="save-icon"
                  onClick={handleSave}
                  title="Save Gender"
                />
                <FaTimes
                  className="cancel-icon"
                  onClick={handleCancel}
                  title="Cancel Edit"
                />
              </>
            ) : (
              <>
                <span className="attribute-value">{character.gender || 'unknown'}</span>
                <FaEdit
                  className="edit-icon"
                  onClick={() => handleEdit('gender')}
                  title="Edit Gender"
                />
              </>
            )}
          </div>
        </div>
        <div className="character-attribute">
          <span className="attribute-key">Homeworld:</span>
          <span className="attribute-value">{character.homeworld || 'unknown'}</span>
        </div>
        <h2>Additional Information</h2>
        {renderCharacterAttributes()}
      </div>
      <div className="add-to-favorites-container">
        <button
          onClick={() => addFavorite(character)}
          disabled={isFavorite}
          className="add-to-favorites-button"
        >
          {isFavorite ? 'View Favorites' : 'Add to Favorites'}
        </button>
      </div>
    </div>
  );
};

export default CharacterDetails;