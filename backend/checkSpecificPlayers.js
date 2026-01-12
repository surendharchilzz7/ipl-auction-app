const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'reference', 'players_2025.json');
try {
    const data = require(filePath);
    console.log(`Loaded ${data.players.length} players.`);

    const terms = ['Duck', 'Ross', 'Smith', 'Warner'];

    terms.forEach(term => {
        const found = data.players.filter(p => p.name.toLowerCase().includes(term.toLowerCase()));
        console.log(`\nResults for "${term}":`);
        found.forEach(p => {
            console.log(`- ${p.name}: Overseas=${p.overseas}`);
        });
    });

} catch (e) {
    console.error("Error reading file:", e.message);
}
