
import React, { useState, useEffect } from 'react';
import { Cow } from '../types';

const BreedCowsPage: React.FC = () => {
  const [cows, setCows] = useState<Cow[]>([]);

  useEffect(() => {
    // Route 4: get-cows-by-breed/:breed
    fetch('http://localhost:5005/api/cow/get-cows-by-breed/Holstein')
      .then(res => res.json())
      .then(data => setCows(data.cows || []));
  }, []);

  return (
    <div style={{padding: '20px'}}>
      <h1>Holstein Cows ({cows.length})</h1>
      <ul>
        {cows.map(cow => (
          <li key={cow.id}>{cow.name} - {cow.milkYield}L/day</li>
        ))}
      </ul>
    </div>
  );
};
export default BreedCowsPage;
