/**
 * DIGIPIN (India Post) decoder.
 * A DIGIPIN like "2KM-9KK-3P98" is a 10-character code that identifies a ~4 m x 4 m
 * square anywhere in India. Decoding it gives the centre latitude/longitude.
 * Algorithm: the national bounding box is split into a 4x4 grid ten times over.
 */
const GRID = [
  ["F", "C", "9", "8"],
  ["J", "3", "2", "7"],
  ["K", "4", "5", "6"],
  ["L", "M", "P", "T"],
];
const BOUNDS = { minLat: 2.5, maxLat: 38.5, minLon: 63.5, maxLon: 99.5 };

const isValidDigipin = (pin) => /^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{4}$/.test(String(pin || "").trim().toUpperCase());

/** Returns { lat, lng } or null if the code is invalid. */
function decodeDigipin(pin) {
  const code = String(pin || "").trim().toUpperCase().replace(/-/g, "");
  if (code.length !== 10) return null;

  let { minLat, maxLat, minLon, maxLon } = BOUNDS;
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
    const lat1 = lat2 - latDiv;
    const lon1 = minLon + lonDiv * col;
    const lon2 = lon1 + lonDiv;
    minLat = lat1; maxLat = lat2; minLon = lon1; maxLon = lon2;
  }
  return { lat: (minLat + maxLat) / 2, lng: (minLon + maxLon) / 2 };
}

/** OpenStreetMap embed URL (free, no API key) centred on the DIGIPIN with a marker. */
function osmEmbedFromDigipin(pin, spanDeg = 0.006) {
  const p = decodeDigipin(pin);
  if (!p) return "";
  const bbox = [p.lng - spanDeg, p.lat - spanDeg / 1.6, p.lng + spanDeg, p.lat + spanDeg / 1.6].map((n) => n.toFixed(6)).join("%2C");
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${p.lat.toFixed(6)}%2C${p.lng.toFixed(6)}`;
}

module.exports = { decodeDigipin, isValidDigipin, osmEmbedFromDigipin };
