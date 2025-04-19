import React from 'react';
import Map3D from './components/Map3D';

const App: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Map3D />
    </div>
  );
};

export default App; 