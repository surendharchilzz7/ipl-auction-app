const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'reference', 'players_2025.json');
const data = require(filePath);

// Specific overrides for the "Retained" stars the user complained about
const starOverrides = {
    "Rajat Patidar": 2.0,
    "Yash Dayal": 1.5,
    "Tilak Varma": 2.0,
    "Nitish Kumar Reddy": 1.5,
    "Ruturaj Gaikwad": 2.0, // Though likely sold/retained
    "Matheesha Pathirana": 2.0,
    "Shivam Dube": 2.0,
    "Tristan Stubbs": 2.0,
    "Abishek Porel": 1.0,
    "Rinku Singh": 2.0,
    "Varun Chakravarthy": 2.0,
    "Harshit Rana": 1.0,
    "Ramandeep Singh": 1.0,
    "Riyan Parag": 2.0,
    "Dhruv Jurel": 2.0,
    "Shimron Hetmyer": 2.0,
    "Sandeep Sharma": 1.0,
    "Sai Sudharsan": 2.0,
    "Rahul Tewatia": 1.5,
    "M Shahrukh Khan": 1.0,
    "Ravi Bishnoi": 2.0,
    "Mayank Yadav": 1.5,
    "Mohsin Khan": 1.0,
    "Ayush Badoni": 1.0,
    "Shashank Singh": 1.5,
    "Prabhsimran Singh": 1.0,
    // Add any others commonly appearing in user's bad list
    "Pat Cummins": 2.0,
    "Travis Head": 2.0,
    "Heinrich Klaasen": 2.0
};

let count = 0;
data.players.forEach(p => {
    // 1. Apply overrides if name matches
    if (starOverrides[p.name]) {
        if (p.basePrice !== starOverrides[p.name]) {
            console.log(`[Override] ${p.name}: ${p.basePrice} -> ${starOverrides[p.name]}`);
            p.basePrice = starOverrides[p.name];
            count++;
        }
    }
    // 2. Fallback logic for ANY remaining 0 base price player
    else if (!p.basePrice || p.basePrice === 0) {
        // If overseas, default to 1.5 (as they are usually capped if imported)
        // If Indian, default to 0.3 (uncapped typically)
        // But to be safe and avoid "best value" noise, let's bump "Overseas" significantly.

        let newPrice = 0.3;

        if (p.overseas) {
            newPrice = 1.0; // Assume capped overseas
        }

        // Check if role is AR (often higher value)
        if (p.role === 'AR') {
            newPrice += 0.2;
        }

        console.log(`[Auto-Fix] ${p.name} (${p.overseas ? 'OS' : 'IND'} ${p.role}): ${p.basePrice} -> ${newPrice}`);
        p.basePrice = newPrice;
        count++;
    }
});

if (count > 0) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`\nUpdated ${count} players in players_2025.json`);
} else {
    console.log("No updates needed.");
}
