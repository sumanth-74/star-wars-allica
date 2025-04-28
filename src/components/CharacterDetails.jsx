import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit } from 'react-icons/fa'; // Import edit icon
import { useFavorites } from '../contexts/FavoritesContext';
import '../App.css'; // Import styles

const CharacterDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { characters, updateCharacter, addFavorite, favorites } = useFavorites();

  // Ensure the characterUrl matches the keys in the characters cache
  const characterUrl = `https://www.swapi.tech/api/people/${id}`;
  console.log('Characters cache:', characters); // Debugging log
  console.log('Character URL:', characterUrl); // Debugging log

  const character = characters[characterUrl];
  const isFavorite = favorites.some((fav) => fav.url === characterUrl);

  const [editingField, setEditingField] = React.useState(null); // Track the field being edited
  const [fieldValue, setFieldValue] = React.useState(''); // Track the value of the field being edited

  const handleEdit = (field) => {
    setEditingField(field);
    setFieldValue(character[field] || ''); // Set the initial value of the field being edited
  };

  const handleSave = () => {
    updateCharacter(character.url, { [editingField]: fieldValue }); // Update the character in the context
    setEditingField(null); // Exit editing mode
  };

  if (!character) {
    return <div>Character details not found.</div>; // Handle missing character details
  }

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
            <span>{character.height || 'unknown'}</span>
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
            <span>{character.gender || 'unknown'}</span>
          )}
          <FaEdit
            className="edit-icon"
            onClick={() => handleEdit('gender')}
            title="Edit Gender"
          />
        </div>
        <p>Homeworld: {character.homeworld || 'unknown'}</p>
      </div>
      <div className="add-to-favorites-container">
        <button
          onClick={() => addFavorite(character)}
          disabled={isFavorite}
          className="add-to-favorites-button"
        >
          {isFavorite ? 'Already in Favorites' : 'Add to Favorites'}
        </button>
      </div>
      {editingField && (
        <div className="edit-actions">
          <button onClick={handleSave} className="save-button">
            Save
          </button>
          <button onClick={() => setEditingField(null)} className="cancel-button">
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default CharacterDetails;