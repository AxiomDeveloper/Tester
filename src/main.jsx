import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom/client';
import maplibregl from 'maplibre-gl';
import Dexie from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';
import ms from 'milsymbol';
import * as Mgrs from 'mgrs'; // Import everything as an object
import './index.css';
import { Crosshair, Map, Navigation, Search, User } from 'lucide-react';

// --- 1. OFFLINE DATABASE SETUP ---
const db = new Dexie('GhostOneDB');
db.version(1).stores({
  targets: '++id, lat, lng, sidc, note, timestamp',
  logs: '++id, msg, timestamp'
});

// --- 2. MAIN APP COMPONENT ---
function App() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const = useState({ grid: 'INIT...', alt: '0m', speed: '0kt' });
  const = useState('');
  
  // Load Targets from DB
  const targets = useLiveQuery(() => db.targets.toArray());

  useEffect(() => {
    if (map.current) return;

    // Initialize Map
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/bright/style.json', // Free Vector Tiles
      center: ,
      zoom: 2,
      pitch: 45,
      attributionControl: false
    });

    map.current.on('load', () => {
      // Add Satellite Raster Layer (Esri World Imagery - Free for non-comm)
      map.current.addSource('satellite', {
        type: 'raster',
        tiles:,
        tileSize: 256
      });
      
      map.current.addLayer({
        id: 'satellite-layer',
        type: 'raster',
        source: 'satellite',
        paint: { 
          'raster-saturation': -0.5, // Tactical desaturation
          'raster-contrast': 0.2 
        }
      }, 'waterway-name'); // Place under labels if possible

      // Add Targets Layer Source
      map.current.addSource('targets', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: }
      });

      map.current.addLayer({
        id: 'targets-layer',
        type: 'symbol',
        source: 'targets',
        layout: {
          'icon-image': ['get', 'sidc'],
          'icon-size': 1.2,
          'icon-allow-overlap': true,
          'text-field': ['get', 'note'],
          'text-offset': [0, 1.5],
          'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
          'text-justify': 'auto',
          'text-size': 12,
          'text-font':
        },
        paint: { 'text-color': '#0f0', 'text-halo-color': '#000', 'text-halo-width': 2 }
      });

      // Geolocate
      const geolocate = new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
        showUserHeading: true
      });
      map.current.addControl(geolocate);
      
      // Auto-trigger location on load (simulated click)
      setTimeout(() => geolocate.trigger(), 1000);
    });

    // Update HUD on move
    map.current.on('move', () => {
      const center = map.current.getCenter();
      try {
        // Safe check for MGRS library
        const gridVal = Mgrs.default? Mgrs.default.forward([center.lng, center.lat]) : 
                       (Mgrs.forward? Mgrs.forward([center.lng, center.lat]) : "LOADING");
        setHudState(prev => ({...prev, grid: gridVal }));
      } catch(e) {
        setHudState(prev => ({...prev, grid: "OUT_OF_BOUNDS" }));
      }
    });

    // LONG PRESS to add Target
    let touchTimer;
    map.current.on('touchstart', (e) => {
      touchTimer = setTimeout(async () => {
        const sidc = 'SFG-UCI----D'; // Friendly Infantry
        await db.targets.add({
          lat: e.lngLat.lat,
          lng: e.lngLat.lng,
          sidc: sidc,
          note: 'TARGET_' + Math.floor(Math.random()*1000),
          timestamp: Date.now()
        });
        navigator.vibrate(200); // Haptic feedback
      }, 800);
    });
    map.current.on('touchend', () => clearTimeout(touchTimer));

  },);

  // Sync DB to Map
  useEffect(() => {
    if(!map.current ||!targets) return;
    
    // Generate Symbols
    targets.forEach(t => {
      if (!map.current.hasImage(t.sidc)) {
        const sym = new ms.Symbol(t.sidc, { size: 25, colorMode: 'Light' });
        const img = new Image();
        img.onload = () => {
            if (!map.current.hasImage(t.sidc)) map.current.addImage(t.sidc, img);
        };
        img.src = sym.asCanvas().toDataURL();
      }
    });

    const geojson = {
      type: 'FeatureCollection',
      features: targets.map(t => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [t.lng, t.lat] },
        properties: { sidc: t.sidc, note: t.note }
      }))
    };

    if(map.current.getSource('targets')) {
      map.current.getSource('targets').setData(geojson);
    }
  }, [targets]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if(!searchQuery) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`);
      const data = await res.json();
      if(data && data) {
        map.current.flyTo({
          center: [parseFloat(data.lon), parseFloat(data.lat)],
          zoom: 14,
          essential: true
        });
      }
    } catch(err) {
      console.error(err);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* MAP CONTAINER */}
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* SCANLINES OVERLAY */}
      <div className="scanlines pointer-events-none" />

      {/* TOP HUD: Search */}
      <div className="absolute top-2 left-2 right-2 z-10 flex gap-2">
        <form onSubmit={handleSearch} className="flex-1 flex hud-panel p-1 rounded">
          <input 
            className="flex-1 bg-transparent border-none outline-none pl-2"
            placeholder="SEARCH SECTOR..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="text-green-500 p-2"><Search size={20}/></button>
        </form>
      </div>

      {/* CENTER CROSSHAIR */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-green-500 opacity-80">
        <Crosshair size={48} strokeWidth={1} />
      </div>

      {/* BOTTOM HUD: Info */}
      <div className="absolute bottom-8 left-2 right-2 hud-panel p-2 rounded flex justify-between text-xs sm:text-sm">
        <div>
          <div className="font-bold border-b border-green-900 mb-1">POS_DATA</div>
          <div>MGRS: {hudState.grid}</div>
          <div>TGTS: {targets?.length |

| 0}</div>
        </div>
        <div className="text-right">
          <div className="font-bold border-b border-green-900 mb-1">SYS_STAT</div>
          <div>SAT: ONLINE</div>
          <div>DB: {targets? 'SYNCED' : 'WAITING'}</div>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
