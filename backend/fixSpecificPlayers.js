const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'reference', 'players_2025.json');
const data = require(filePath);

const updates = {
    "Rovman Powell": 1.5,
    "David Miller": 2.0,
    "Nitish Kumar Reddy": 1.5,
    "Sherfane Rutherford": 1.5,
    "Mark Chapman": 1.0,
    // Add others that might be common targets
    "Azmatullah Omarzai": 1.5,
    "Wanindu Hasaranga": 2.0,
    "Rachin Ravindra": 2.0,
    "Gerald Coetzee": 2.0,
    "Dilshan Madushanka": 1.5
};

let count = 0;
data.players.forEach(p => {
    if (updates[p.name]) {
        if (p.basePrice !== updates[p.name]) {
            console.log(`Updating ${p.name}: ${p.basePrice || 0} -> ${updates[p.name]} Cr`);
            p.basePrice = updates[p.name];
            count++;
        } else {
            console.log(`${p.name} already correct: ${p.basePrice} Cr`);
        }
    }
});

if (count > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`\nUpdated ${count} players in players_2025.json`);
} else {
    console.log("No updates needed.");
}
