import React, { useState } from 'react';
import TacticalMap from './components/TacticalMap';
import HudOverlay from './components/HudOverlay';

export default function App() {
  const [viewCenter, setViewCenter] = useState(null); // Current center for Grid calculation
  const = useState(null); // Trigger for animation

  return (
    <div className="relative w-screen h-screen bg-black overflow-hidden select-none">
      
      {/* 1. The Map Layer */}
      <TacticalMap 
        flyToLocation={flyTo} 
        onMove={(center) => setViewCenter(center)}
      />

      {/* 2. The CRT Scanline Effect Overlay (CSS) */}
      <div className="scanlines pointer-events-none absolute inset-0 z-50"></div>

      {/* 3. The UI Layer */}
      <HudOverlay 
        centerPos={viewCenter} 
        onSearch={(coords) => setFlyTo(coords)}
      />
      
    </div>
  );
}
