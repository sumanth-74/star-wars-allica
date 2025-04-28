import React from 'react';
import '../App.css'; // Ensure this import is correct

const Shimmer = ({ count = 12 }) => {
  const shimmerItems = Array.from({ length: count });

  return (
    <div className="shimmer-container">
      {shimmerItems.map((_, index) => (
        <div key={index} className="shimmer-item"></div>
      ))}
    </div>
  );
};

export default Shimmer;
