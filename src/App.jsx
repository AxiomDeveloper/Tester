import React, { useState } from 'react';
import TacticalMap from './components/TacticalMap';
import HudOverlay from './components/HudOverlay.jsx';

export default function App() {
  const [viewCenter, setViewCenter] = useState(null);
  const [flyTo, setFlyTo] = useState(null);

  return (
    <div className="app-root">
      <TacticalMap flyToLocation={flyTo} onMove={(center) => setViewCenter(center)} />
      <div className="scanlines" />
      <HudOverlay centerPos={viewCenter} onSearch={(coords) => setFlyTo(coords)} />
    </div>
  );
}
