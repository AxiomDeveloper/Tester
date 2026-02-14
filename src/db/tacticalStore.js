import Dexie from 'dexie';

export const db = new Dexie('TacticalCOP');

db.version(1).stores({
  units: '++id, sidc, lat, lng, type, timestamp', // Index for querying
  routes: '++id, name, timestamp',
  settings: 'key, value'
});

// Helper to add a unit
export const addUnit = async (sidc, lat, lng) => {
  await db.units.add({
    sidc,
    lat,
    lng,
    type: 'friendly',
    timestamp: new Date()
  });
};
