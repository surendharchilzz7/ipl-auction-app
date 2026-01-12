const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'reference', 'players_2025.json');
const data = require(filePath);

const updates = {
    "Shai Hope": 1.25,
    "Mayank Agarwal": 1.0,
    "Will Young": 1.0,
    "Ashton Turner": 1.0,
    "Akash Deep": 0.2, // Keep as is if user didn't complain, but screenshot showed him. If he's 0.2 in screenshot and valid, fine. But user said "at least fill with OTHER players".
    "Rahul Chahar": 0.2 // Screenshot showed him too.
};

// Check and update
let count = 0;
data.players.forEach(p => {
    if (updates[p.name]) {
        if (p.basePrice !== updates[p.name]) {
            console.log(`Updating ${p.name}: ${p.basePrice} -> ${updates[p.name]} Cr`);
            p.basePrice = updates[p.name];
            count++;
        } else {
            console.log(`${p.name} already has correct base price: ${p.basePrice} Cr`);
        }
    }
});

if (count > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${count} players in players_2025.json`);
} else {
    console.log("No updates needed.");
}
