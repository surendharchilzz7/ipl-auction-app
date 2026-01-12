/**
 * Regenerate playerPhotos.js from the photos directory
 */

const fs = require('fs');
const path = require('path');

const PHOTO_DIR = path.join(__dirname, '../frontend/public/player-photos');
const OUTPUT_FILE = path.join(__dirname, '../frontend/src/data/playerPhotos.js');

// Read all files
const files = fs.readdirSync(PHOTO_DIR).filter(f => f.endsWith('.png'));

// Build the mapping object
const mapping = {};
for (const file of files) {
    const name = file.replace('.png', '').replace(/_/g, ' ');
    mapping[name] = `/player-photos/${file}`;
}

// Sort entries alphabetically
const sortedMapping = Object.fromEntries(
    Object.entries(mapping).sort(([a], [b]) => a.localeCompare(b))
);

// Generate the JS file
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#1e293b"/><circle cx="50" cy="35" r="18" fill="#475569"/><ellipse cx="50" cy="80" rx="28" ry="22" fill="#475569"/></svg>`;

const content = `/**
 * AUTO-GENERATED - ${Object.keys(sortedMapping).length} players
 */
const DEFAULT_PLAYER_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(\`${svgContent}\`);
const LOCAL_PLAYER_PHOTOS = ${JSON.stringify(sortedMapping, null, 4)};
const PLAYER_LOOKUP = {};
for (const n of Object.keys(LOCAL_PLAYER_PHOTOS)) PLAYER_LOOKUP[n.toLowerCase()] = n;
function getPlayerPhotoUrl(name) {
    if (!name) return null;
    const n = name.trim(), k = n.toLowerCase();
    return LOCAL_PLAYER_PHOTOS[n] || (PLAYER_LOOKUP[k] ? LOCAL_PLAYER_PHOTOS[PLAYER_LOOKUP[k]] : null);
}
function getDefaultPlayerImage() { return DEFAULT_PLAYER_IMAGE; }
const PLAYER_IDS = {}, LOCAL_PLAYERS = new Set(Object.keys(LOCAL_PLAYER_PHOTOS));
export { getPlayerPhotoUrl, getDefaultPlayerImage, DEFAULT_PLAYER_IMAGE, PLAYER_IDS, LOCAL_PLAYER_PHOTOS, LOCAL_PLAYERS };
`;

fs.writeFileSync(OUTPUT_FILE, content);
console.log(`Generated playerPhotos.js with ${Object.keys(sortedMapping).length} players`);
