const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data', 'reference', 'players_2025.json');
try {
    const data = require(filePath);

    console.log("Total players:", data.players.length);

    const zeroBasePlayers = data.players.filter(p => !p.basePrice || p.basePrice === 0);
    console.log(`Players with 0 Base Price: ${zeroBasePlayers.length}`);

    // Sample names
    console.log("\nSample 0 Base Price Players:");
    zeroBasePlayers.slice(0, 20).forEach(p => console.log(`- ${p.name} (${p.team || 'No Team'})`));

    // Check specific user complaints
    const complaints = ["Shai Hope", "Will Young", "Ashton Turner", "Rajat Patidar", "Matheesha Pathirana", "Tilak Varma", "Abishek Porel"];
    console.log("\nUser complaint check:");
    complaints.forEach(name => {
        const p = data.players.find(pl => pl.name === name);
        if (p) {
            console.log(`${name}: Base Price = ${p.basePrice}`);
        } else {
            console.log(`${name}: Not found`);
        }
    });

} catch (err) {
    console.error(err);
}
