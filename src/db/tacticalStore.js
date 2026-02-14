import Dexie from 'dexie';

export const db = new Dexie('GhostOneDB');

// Define the schema (structure)
db.version(1).stores({
  // &id = unique auto-incrementing ID
  // sidc = symbol identification code (military icon)
  // lat, lng = coordinates
  targets: '++id, lat, lng, sidc, note, timestamp', 
  
  // For recording path history
  tracks: '++id, mission_id, timestamp' 
});

// Helper: Add a standard hostile target
export const addHostile = async (lat, lng) => {
  await db.targets.add({
    lat,
    lng,
    sidc: 'SHG-UCI----D', // Standard Hostile Infantry
    note: 'DETECTED',
    timestamp: Date.now()
  });
};

// Helper: Add a friendly unit
export const addFriendly = async (lat, lng) => {
  await db.targets.add({
    lat,
    lng,
    sidc: 'SFG-UCI----D', // Friendly Infantry
    note: 'TEAM_ALPHA',
    timestamp: Date.now()
  });
};
