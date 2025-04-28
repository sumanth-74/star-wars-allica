import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaEdit, FaSave, FaTimes } from 'react-icons/fa'; // Import icons
import { useFavorites } from '../../contexts/FavoritesContext'; // Updated path
import '../../App.css';

const CharacterDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { characters, updateCharacter, addFavorite, favorites } = useFavorites();

  // Ensure the characterUrl matches the keys in the characters cache
  const characterUrl = `https://www.swapi.tech/api/people/${id}`;
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

  const handleCancel = () => {
    setEditingField(null); // Exit editing mode without saving
  };

  if (!character) {
    return <div>Character details not found.</div>; // Handle missing character details
  }

  const renderCharacterAttributes = () => {
    const attributes = Object.entries(character).filter(
      ([key]) => !['url', 'uid', 'name', 'height', 'gender', 'homeworld'].includes(key) // Exclude already displayed fields
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
          {isFavorite ? 'Already in Favorites' : 'Add to Favorites'}
        </button>
      </div>
    </div>
  );
};

export default CharacterDetails;