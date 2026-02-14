import React, { useState } from 'react';
import { Search, Crosshair, Menu } from 'lucide-react';
import * as Mgrs from 'mgrs';

export default function HudOverlay({ centerPos, onSearch }) {
  const [query, setQuery] = useState('');

  // Convert Center Lat/Lng to MGRS Grid
  const getGrid = () => {
    if (!centerPos) return 'NO_SAT_LINK';
    try {
      // Safe check for MGRS lib
      return Mgrs.default? Mgrs.default.forward([centerPos.lng, centerPos.lat]) 
           : (Mgrs.forward? Mgrs.forward([centerPos.lng, centerPos.lat]) : 'CALCULATING...');
    } catch (e) {
      return 'OUT_OF_BOUNDS';
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query) return;
    
    // Free Nominatim Search
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`);
      const data = await res.json();
      if (data && data.length > 0) {
        // Pass result up to parent
        onSearch([parseFloat(data.lon), parseFloat(data.lat)]);
      }
    } catch (err) {
      console.error("Link Failure", err);
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex flex-col justify-between p-2">
      
      {/* TOP BAR */}
      <div className="pointer-events-auto flex items-center gap-2">
        <div className="hud-panel p-2 rounded border border-tac-green bg-black/80 backdrop-blur">
          <Menu className="text-tac-green" />
        </div>
        
        <form onSubmit={handleSearch} className="hud-panel flex-1 flex items-center rounded border border-tac-green bg-black/80 backdrop-blur p-1">
          <input 
            className="w-full bg-transparent text-tac-green font-mono text-sm placeholder-green-800 outline-none px-2 uppercase"
            placeholder="SECURE_SEARCH..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="p-2 text-tac-green">
            <Search size={18} />
          </button>
        </form>
      </div>

      {/* CROSSHAIR (Center Screen) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50">
        <Crosshair className="text-tac-alert w-12 h-12" strokeWidth={1} />
      </div>

      {/* BOTTOM INFO BAR */}
      <div className="hud-panel mt-auto rounded border border-tac-green bg-black/80 backdrop-blur p-3">
        <div className="grid grid-cols-2 gap-4 text-xs font-mono text-tac-green">
          <div>
            <div className="text-gray-500 text-[10px]">GRID_REF (MGRS)</div>
            <div className="text-base font-bold tracking-widest">{getGrid()}</div>
          </div>
          <div className="text-right">
            <div className="text-gray-500 text-[10px]">SYS_STATUS</div>
            <div className="text-tac-alert animate-pulse">LIVE_FEED</div>
          </div>
        </div>
      </div>

    </div>
  );
}
