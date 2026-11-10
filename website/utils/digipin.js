// DIGIPIN (India Post) → latitude/longitude. Same algorithm as backend/utils/digipin.js.
const GRID = [
  ["F", "C", "9", "8"],
  ["J", "3", "2", "7"],
  ["K", "4", "5", "6"],
  ["L", "M", "P", "T"],
];

/** Returns { lat, lng } for a code like "2KM-9KK-3P98", or null if invalid. */
export function decodeDigipin(pin) {
  const code = String(pin || "").trim().toUpperCase().replace(/-/g, "");
  if (code.length !== 10) return null;

  let minLat = 2.5, maxLat = 38.5, minLon = 63.5, maxLon = 99.5;
  for (const ch of code) {
    let row = -1, col = -1;
    for (let r = 0; r < 4; r++) {
      const c = GRID[r].indexOf(ch);
      if (c !== -1) { row = r; col = c; break; }
    }
    if (row === -1) return null;
    const latDiv = (maxLat - minLat) / 4;
    const lonDiv = (maxLon - minLon) / 4;
    const lat2 = maxLat - latDiv * row;
    const lon1 = minLon + lonDiv * col;
    minLat = lat2 - latDiv; maxLat = lat2; minLon = lon1; maxLon = lon1 + lonDiv;
  }
  return { lat: (minLat + maxLat) / 2, lng: (minLon + maxLon) / 2 };
}

/** Google Maps directions link to the DIGIPIN location (works on phones and desktop). */
export function directionsHref(pin) {
  const p = decodeDigipin(pin);
  return p ? `https://www.google.com/maps/dir/?api=1&destination=${p.lat.toFixed(6)},${p.lng.toFixed(6)}` : "";
}
