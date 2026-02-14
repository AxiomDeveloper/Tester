import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import ms from 'milsymbol';
import * as MGRS from 'mgrs';
import { db } from '../db/tacticalStore';
import { useLiveQuery } from 'dexie-react-hooks';

// Tactical symbol generator
const createSymbol = (sidc) => {
  const symbol = new ms.Symbol(sidc, { 
    size: 30,
    simpleStatusModifier: true,
    icon: true 
  });
  return symbol.asCanvas().toDataURL();
};

export default function TacticalMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [zoom, setZoom] = useState(10);
  const = useState('LOADING...');
  
  // Live query from Dexie DB [4]
  const units = useLiveQuery(() => db.units.toArray());

  useEffect(() => {
    if (map.current) return;

    // Initialize MapLibre
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      // Use a dark/satellite style. You can swap this for a local style.json
      style: 'https://demotiles.maplibre.org/style.json', 
      center: [-74.5, 40], // Start pos
      zoom: 10,
      pitch: 45, // Tactical 3D view
      bearing: 0,
      attributionControl: false
    });

    map.current.on('load', () => {
      // 1. Add 3D Terrain [7]
      map.current.addSource('terrain', {
        type: 'raster-dem',
        url: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
        tileSize: 256
      });
      map.current.setTerrain({ source: 'terrain', exaggeration: 1.5 });

      // 2. Add Satellite Imagery (Desaturated for "Midnight" look)
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
            'raster-saturation': -0.8, // Make it monochrome
            'raster-contrast': 0.4
        }
      }, 'waterway-label'); // Put under labels

      // 3. Add Units Layer
      map.current.addSource('units-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: }
      });
      
      map.current.addLayer({
        id: 'units-layer',
        type: 'symbol',
        source: 'units-source',
        layout: {
          'icon-image': ['get', 'sidc'],
          'icon-size': 1.0,
          'icon-allow-overlap': true
        }
      });
    });

    // Cursor Tracking (MGRS Conversion) [2]
    map.current.on('mousemove', (e) => {
        try {
            // Convert Lat/Lon to MGRS
            const mgrsStr = MGRS.forward([e.lngLat.lng, e.lngLat.lat]);
            setCursorMGRS(mgrsStr);
        } catch (err) {
            setCursorMGRS("OUT OF BOUNDS");
        }
    });

    // Touch Interaction: Long press to add unit
    let touchTimer = null;
    map.current.on('touchstart', (e) => {
        touchTimer = setTimeout(async () => {
            // Add a friendly infantry unit at touch location
            await db.units.add({
                sidc: 'SFG-UCI----D', // Friendly Infantry
                lat: e.lngLat.lat,
                lng: e.lngLat.lng,
                timestamp: Date.now()
            });
            navigator.vibrate(50); // Haptic feedback
        }, 800);
    });
    map.current.on('touchend', () => clearTimeout(touchTimer));

  },);

  // Update units when DB changes [8]
  useEffect(() => {
    if (!map.current ||!map.current.getSource('units-source') ||!units) return;

    const features = units.map(u => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [u.lng, u.lat] },
        properties: { sidc: u.sidc }
    }));

    // Dynamically generate and load symbol images if missing
    units.forEach(u => {
        if (!map.current.hasImage(u.sidc)) {
            const img = new Image();
            img.onload = () => {
                if (!map.current.hasImage(u.sidc)) map.current.addImage(u.sidc, img);
            };
            img.src = createSymbol(u.sidc);
        }
    });

    map.current.getSource('units-source').setData({
        type: 'FeatureCollection',
        features: features
    });

  }, [units]);

  return (
    <div className="relative w-full h-full nvg-mode scanlines">
      <div ref={mapContainer} className="absolute inset-0" />
      
      {/* HUD Overlay */}
      <div className="absolute top-4 left-4 p-2 bg-tac-dark/80 border border-tac-green text-tac-green text-xs font-mono pointer-events-none">
        <h1 className="text-lg font-bold border-b border-tac-green mb-1">TACTICAL_COP_V1</h1>
        <p>SAT_LINK: ACTIVE</p>
        <p>GRID: {cursorMGRS}</p>
        <p>UNITS: {units?.length |

| 0}</p>
      </div>

      {/* Crosshair Center */}
      <div className="absolute top-1/2 left-1/2 w-8 h-8 border-2 border-tac-alert -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-50"></div>
    </div>
  );
}
