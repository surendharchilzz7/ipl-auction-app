const fs = require('fs');
const playersData = require('./data/reference/players_2025.json');

const teams = {};

playersData.players.forEach(p => {
    if (p.sold && p.soldTo) {
        if (!teams[p.soldTo]) teams[p.soldTo] = [];
        teams[p.soldTo].push(p);
    }
});

console.log("Checking Initial Data (players_2025.json)...");
let violationFound = false;

Object.keys(teams).forEach(teamName => {
    const players = teams[teamName];
    const overseasCount = players.filter(p => p.overseas).length;

    console.log(`${teamName}: ${players.length} players, ${overseasCount} overseas`);

    if (overseasCount > 8) {
        console.error(`VIOLATION: ${teamName} has ${overseasCount} overseas players!`);
        violationFound = true;
    }
});

if (!violationFound) {
    console.log("No violations found in initial JSON data.");
}
