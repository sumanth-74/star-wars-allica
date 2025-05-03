import React from 'react';
import './Shimmer.css';

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
