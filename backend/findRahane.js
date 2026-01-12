const fs = require('fs');
const data = require('./data/reference/players_2025.json');

const rahane = data.players.find(p => p.name === "Ajinkya Rahane");
if (rahane) {
    console.log("Found Rahane:", JSON.stringify(rahane, null, 2));
} else {
    console.log("Rahane NOT FOUND");
}
