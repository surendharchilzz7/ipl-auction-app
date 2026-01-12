/**
 * Find players who need photos
 * Compares players_2025.json with existing photos
 */

const fs = require('fs');
const path = require('path');

const PHOTO_DIR = path.join(__dirname, '../frontend/public/player-photos');
const PLAYERS_FILE = path.join(__dirname, 'data/reference/players_2025.json');

// Get existing photos (names without .png, underscores to spaces)
const existingPhotos = new Set();
const photoFiles = fs.readdirSync(PHOTO_DIR).filter(f => f.endsWith('.png'));
for (const file of photoFiles) {
    const name = file.replace('.png', '').replace(/_/g, ' ').toLowerCase();
    existingPhotos.add(name);
}

console.log(`\nExisting photos: ${existingPhotos.size}\n`);

// Load players
const playersData = JSON.parse(fs.readFileSync(PLAYERS_FILE, 'utf8'));
const allPlayers = playersData.players;

console.log(`Total players in JSON: ${allPlayers.length}\n`);

// Find players without photos
const missingPlayers = [];
const hasPhotos = [];

for (const player of allPlayers) {
    const nameLower = player.name.toLowerCase();
    if (existingPhotos.has(nameLower)) {
        hasPhotos.push(player.name);
    } else {
        missingPlayers.push(player.name);
    }
}

// Deduplicate missing players
const uniqueMissing = [...new Set(missingPlayers)];

console.log(`Players WITH photos: ${hasPhotos.length}`);
console.log(`Players WITHOUT photos: ${uniqueMissing.length}\n`);

console.log('='.repeat(50));
console.log('Players needing photos:');
console.log('='.repeat(50));
uniqueMissing.forEach((name, i) => {
    console.log(`${i + 1}. ${name}`);
});

// Save to file for reference
fs.writeFileSync(
    path.join(__dirname, 'missing_photos.json'),
    JSON.stringify(uniqueMissing, null, 2)
);

console.log(`\nSaved list to missing_photos.json`);
