const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'reference', 'players_2025.json');
const data = require(filePath);

const nonOverseas = data.players
    .filter(p => !p.overseas)
    .map(p => p.name)
    .sort();

console.log(`Writing ${nonOverseas.length} players to non_overseas_players.json`);
fs.writeFileSync('non_overseas_players.json', JSON.stringify(nonOverseas, null, 2));
