const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'reference', 'players_2025.json');
const data = require(filePath);

const nonOverseas = data.players
    .filter(p => !p.overseas)
    .map(p => p.name)
    .sort();

console.log('--- POTENTIAL OVERSEAS PLAYERS (Currently marked as Local) ---');
console.log(JSON.stringify(nonOverseas, null, 2));
console.log(`\nTotal Non-Overseas Count: ${nonOverseas.length}`);
