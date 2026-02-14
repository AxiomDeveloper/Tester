import React, { useState } from 'react';
import * as mgrs from 'mgrs';

export default function HudOverlay({ centerPos, onSearch }) {
  const [query, setQuery] = useState('');

  const getGrid = () => {
    if (!centerPos) return 'NO_SAT_LINK';
    try {
      return mgrs.forward([centerPos.lng, centerPos.lat]);
    } catch (e) {
      return 'OUT_OF_BOUNDS';
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const normalized = query.trim();
    if (!normalized) return;

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(normalized)}`,
      );
      const data = await res.json();
      if (data && data.length > 0) {
        onSearch([parseFloat(data[0].lon), parseFloat(data[0].lat)]);
      }
    } catch (err) {
      console.error('Link Failure', err);
    }
  };

  return (
    <div className="hud-overlay">
      <div className="hud-top-row hud-panel">
        <div className="hud-icon" aria-hidden>
          ☰
        </div>

        <form onSubmit={handleSearch} className="hud-search-form">
          <input
            className="hud-input"
            placeholder="SECURE_SEARCH..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="hud-button" aria-label="Search">
            ⌕
          </button>
        </form>
      </div>

      <div className="hud-crosshair" aria-hidden>
        ✛
      </div>

      <div className="hud-panel hud-bottom-row">
        <div>
          <div className="hud-caption">GRID_REF (MGRS)</div>
          <div className="hud-grid">{getGrid()}</div>
        </div>
        <div className="hud-status-wrap">
          <div className="hud-caption">SYS_STATUS</div>
          <div className="hud-status">LIVE_FEED</div>
        </div>
      </div>
    </div>
  );
}
