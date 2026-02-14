import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import ms from 'milsymbol';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addFriendly } from '../db/tacticalStore';

export default function TacticalMap({ flyToLocation, onMove }) {
  const mapContainer = useRef(null);
  const map = useRef(null);

  const targets = useLiveQuery(() => db.targets.toArray(), [], []);

  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/bright/style.json',
      center: [-74.5, 40],
      zoom: 11,
      pitch: 45,
      attributionControl: false,
    });

    map.current.on('load', () => {
      map.current.addSource('satellite', {
        type: 'raster',
        tiles: ['https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
        tileSize: 256,
      });

      map.current.addLayer(
        {
          id: 'satellite-layer',
          type: 'raster',
          source: 'satellite',
          paint: {
            'raster-saturation': -0.6,
            'raster-contrast': 0.2,
            'raster-opacity': 0.55,
          },
        },
        'waterway-name',
      );

      map.current.addSource('targets', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] },
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
          'text-size': 10,
          'text-font': ['Noto Sans Regular'],
        },
        paint: { 'text-color': '#0f0', 'text-halo-color': '#000', 'text-halo-width': 1 },
      });
    });

    map.current.on('move', () => {
      if (onMove) onMove(map.current.getCenter());
    });

    let touchTimer;
    map.current.on('touchstart', (e) => {
      touchTimer = setTimeout(() => {
        addFriendly(e.lngLat.lat, e.lngLat.lng);
        if ('vibrate' in navigator) navigator.vibrate(50);
      }, 800);
    });
    map.current.on('touchend', () => clearTimeout(touchTimer));
    map.current.on('mousedown', () => clearTimeout(touchTimer));

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [onMove]);

  useEffect(() => {
    if (map.current && flyToLocation) {
      map.current.flyTo({
        center: flyToLocation,
        zoom: 14,
        essential: true,
        speed: 1.5,
      });
    }
  }, [flyToLocation]);

  useEffect(() => {
    if (!map.current || !targets) return;

    targets.forEach((t) => {
      if (!map.current.hasImage(t.sidc)) {
        const sym = new ms.Symbol(t.sidc, { size: 30, colorMode: 'Light' });
        const img = new Image();
        img.onload = () => {
          if (map.current && !map.current.hasImage(t.sidc)) map.current.addImage(t.sidc, img);
        };
        img.src = sym.asCanvas().toDataURL();
      }
    });

    const geojson = {
      type: 'FeatureCollection',
      features: targets.map((t) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [t.lng, t.lat] },
        properties: { sidc: t.sidc, note: t.note },
      })),
    };

    const source = map.current.getSource('targets');
    if (source) source.setData(geojson);
  }, [targets]);

  return <div ref={mapContainer} className="map-root" />;
}
