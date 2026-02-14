import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import TacticalMap from './components/TacticalMap';

function App() {
  return (
    <HashRouter>
      <div className="w-screen h-screen bg-black overflow-hidden">
        <Routes>
          <Route path="/" element={<TacticalMap />} />
        </Routes>
      </div>
    </HashRouter>
  );
}

export default App;
