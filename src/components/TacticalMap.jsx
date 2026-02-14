import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import ms from 'milsymbol';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addFriendly } from '../db/tacticalStore';

export default function TacticalMap({ flyToLocation, onMove }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  
  // 1. Live Database Connection
  const targets = useLiveQuery(() => db.targets.toArray());

  // 2. Initialize Map
  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      // OpenFreeMap is excellent for free, no-API-key vector tiles
      style: 'https://tiles.openfreemap.org/styles/bright/style.json',
      center: [-74.5, 40],
      zoom: 11,
      pitch: 45, // 3D tilt
      attributionControl: false
    });

    map.current.on('load', () => {
      // Add Satellite Layer (Esri World Imagery)
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
          'raster-saturation': -0.6, // Desaturate for "Tactical" look
          'raster-contrast': 0.2
        }
      }, 'waterway-name'); // Place underneath labels

      // Add Targets Source
      map.current.addSource('targets', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: }
      });

      // Add Targets Layer (Using text-field for symbols if images fail, but we will use images)
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
          'text-size': 10,
          'text-font':
        },
        paint: { 'text-color': '#0f0', 'text-halo-color': '#000', 'text-halo-width': 1 }
      });
    });

    // 3. Interactions
    map.current.on('move', () => {
      if(onMove) onMove(map.current.getCenter());
    });

    // Long Press to add unit (0.8s hold)
    let touchTimer;
    map.current.on('touchstart', (e) => {
      touchTimer = setTimeout(() => {
        addFriendly(e.lngLat.lat, e.lngLat.lng);
        navigator.vibrate(50); // Haptic feedback
      }, 800);
    });
    map.current.on('touchend', () => clearTimeout(touchTimer));
    map.current.on('mousedown', () => clearTimeout(touchTimer)); // clear on drag
  },);

  // 4. Handle "Fly To" requests from Search
  useEffect(() => {
    if (map.current && flyToLocation) {
      map.current.flyTo({
        center: flyToLocation,
        zoom: 14,
        essential: true,
        speed: 1.5 // Slower, cinematographic movement
      });
    }
  },);

  // 5. Sync Database -> Map
  useEffect(() => {
    if (!map.current ||!targets) return;

    // A. Generate Symbols dynamically
    targets.forEach(t => {
      if (!map.current.hasImage(t.sidc)) {
        const sym = new ms.Symbol(t.sidc, { size: 30, colorMode: 'Light' });
        const img = new Image();
        img.onload = () => {
           if (!map.current.hasImage(t.sidc)) map.current.addImage(t.sidc, img);
        };
        img.src = sym.asCanvas().toDataURL();
      }
    });

    // B. Update Data Source
    const geojson = {
      type: 'FeatureCollection',
      features: targets.map(t => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [t.lng, t.lat] },
        properties: { sidc: t.sidc, note: t.note }
      }))
    };

    const source = map.current.getSource('targets');
    if (source) source.setData(geojson);

  }, [targets]);

  return <div ref={mapContainer} className="absolute inset-0 z-0" />;
}
