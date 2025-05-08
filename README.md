# Star Wars Application

This project is a Star Wars web application that allows users to explore characters, view their details, and manage their favorite characters. The application is built using React and leverages modern libraries like `react-query` for data fetching and caching.

### Test Cases 

![Screenshot 2025-05-08 at 6 39 30 PM](https://github.com/user-attachments/assets/9a18de01-8e5d-4ac5-b503-9cd8e2595015)


## Deployment

The code has been deployed to vercel and the live version can be accessed through this link: https://star-wars-allica.vercel.app/

## Screenshots
![Screenshot 2025-05-01 at 12 00 26 AM](https://github.com/user-attachments/assets/f5289f80-7fff-4868-8f34-39210bad658d)
![Screenshot 2025-05-01 at 12 00 52 AM](https://github.com/user-attachments/assets/7afbddb2-d635-4009-b5e4-fda47cabf78f)
![Screenshot 2025-05-01 at 12 01 19 AM](https://github.com/user-attachments/assets/24cbc80d-57fb-45e1-904e-e830be943cac)


## Features

### 1. Character List
- Displays a paginated list of Star Wars characters.
- Allows users to search for characters by name.
- Shows basic details like name, gender, and homeworld.
- Clicking on a character navigates to the character's detailed view.

### 2. Character Details
- Displays detailed information about a selected character.
- Allows editing of specific fields like height and gender.
- Fetches and displays the character's homeworld details.
- Provides an option to add the character to the favorites list.

Note: Couldn't implement the films and starship details as the api response didn't have any information related to them.

### 3. Favorites
- Displays a list of favorite characters added by the user.
- Allows users to remove characters from the favorites list.

### 4. Error Handling
- Includes an `ErrorBoundary` component to catch and display errors gracefully.
- Uses a custom `ErrorContext` to show error messages for specific operations.

### 5. Pagination
- Provides server-side offset pagination controls for navigating through the character list. 

### 6. Search Bar
- Allows users to search for characters by name. It user server-side debounced filtering by making api request using serach parameter with auto suggestions and response is displayed

## Components

### 1. `CharacterList`
- Fetches and displays a list of characters.
- Handles search and pagination.
- Combines character and homeworld data for display. Also caches the character details and homeworld details to be used in other pages

### 2. `CharacterDetails`
- Fetches and displays detailed information about a character.
- Allows editing of character attributes like gender and height.
- Integrates with the favorites feature.

### 3. `Favorites`
- Displays a list of favorite characters.
- Allows removal of characters from the favorites list.

### 4. `ErrorBoundary`
- Catches JavaScript errors in child components.
- Displays a fallback UI with an option to retry.

### 5. `SearchBar`
- Provides a search input for filtering characters by name.

### 6. `Pagination`
- Provides controls for navigating through paginated data.

## Contexts

### 1. `ErrorContext`
- Provides a mechanism to display error messages across the application.

### 2. `FavoritesContext`
- Manages the state of favorite characters.

## API Integration
- Uses `react-query` for data fetching and caching.
- Fetches data from the Star Wars API (`https://www.swapi.tech/api`).

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/sumanth-74/star-wars-allica.git
   ```

2. Navigate to the project directory:
   ```bash
   cd star-wars
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm start
   ```

## Testing

- The project includes unit tests for key components.
- Run tests using:
  ```bash
  npm test
  ```

## Folder Structure

```
src/
├── components/
│   ├── CharacterList/
│   ├── CharacterDetails/
│   ├── Favorites/
│   ├── ErrorBoundary/
│   ├── Pagination/
│   ├── SearchBar/
├── contexts/
├── services/
├── App.tsx
├── index.tsx
```

## Dependencies

- React
- React Router
- React Query
- TypeScript
- Jest & React Testing Library


