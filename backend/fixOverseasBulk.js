const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'reference', 'players_2025.json');
const data = require(filePath);

const specificStars = {
    "Jos Buttler": 2.0,
    "Nicholas Pooran": 2.0,
    "Aiden Markram": 2.0,
    "Noor Ahmad": 10.0, // Retained? value him high to keep him out of "Best Value"
    "Rahmanullah Gurbaz": 1.5,
    "Rashid Khan": 2.0,
    "David Miller": 2.0,
    "Sunil Narine": 2.0,
    "Andre Russell": 2.0,
    "Heinrich Klaasen": 2.0,
    "Travis Head": 2.0,
    "Pat Cummins": 2.0,
    "Mitchell Starc": 2.0,
    "Kagiso Rabada": 2.0,
    "Trent Boult": 2.0,
    "Quinton de Kock": 2.0,
    "Faf du Plessis": 2.0,
    "Glenn Maxwell": 2.0,
    "Sam Curran": 2.0,
    "Liam Livingstone": 2.0,
    "Jonny Bairstow": 2.0
};

let count = 0;

data.players.forEach(p => {
    // 1. Specific Fixes (Screenshot players)
    if (specificStars[p.name]) {
        if (p.basePrice !== specificStars[p.name]) {
            console.log(`[Star Fix] ${p.name}: ${p.basePrice} -> ${specificStars[p.name]}`);
            p.basePrice = specificStars[p.name];
            count++;
        }
    }
    // 2. Generic Overseas Fix
    // If player is OVERSEAS and has Low/Zero Base Price, bump them up.
    // Real "0.2 Cr" overseas players are rare in these lists (usually 1 Cr+)
    else if (p.overseas) {
        if (!p.basePrice || p.basePrice <= 0.2) {
            console.log(`[Overseas Fix] ${p.name}: ${p.basePrice} -> 1.5`);
            p.basePrice = 1.5; // Safe default high enough to be excluded from Best Value
            count++;
        }
    }
});

if (count > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`\nUpdated ${count} players in players_2025.json`);
} else {
    console.log("No updates needed.");
}
