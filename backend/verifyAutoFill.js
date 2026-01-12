const { autoFillTeams } = require('./engines/aiAutoFillEngine');

const mockRoom = {
    teams: [
        { name: "CSK", players: [], budget: 120 },
        { name: "MI", players: [], budget: 120 }
    ],
    auctionPool: [],
    unsoldPlayers: [
        { id: "1", name: "Virat Kohli", role: "BAT", basePrice: 2, overseas: false },
        { id: "2", name: "MS Dhoni", role: "WK", basePrice: 2, overseas: false },
        { id: "3", name: "Random Player", role: "BOWL", basePrice: 0.2, overseas: false },
        { id: "4", name: "High Base Player", role: "AR", basePrice: 2, overseas: true }
    ]
};

console.log("Running Auto Fill Verification...");
autoFillTeams(mockRoom);

console.log("\n--- Results ---");
mockRoom.teams.forEach(team => {
    console.log(`Team ${team.name}:`);
    team.players.forEach(p => {
        console.log(`  - ${p.name}: Sold for ${p.soldPrice} Cr (Base: ${p.basePrice})`);

        if (["Virat Kohli", "MS Dhoni"].includes(p.name)) {
            if (p.soldPrice < 30 || p.soldPrice > 40) {
                console.error(`    FAIL: ${p.name} price ${p.soldPrice} is out of 30-40 range`);
            } else {
                console.log(`    PASS: ${p.name} price within expected range.`);
            }
        }

        if (p.name === "High Base Player") {
            if (p.soldPrice < 5 || p.soldPrice > 10) {
                console.error(`    FAIL: ${p.name} price ${p.soldPrice} is out of 5-10 range`);
            } else {
                console.log(`    PASS: ${p.name} price within expected range.`);
            }
        }
    });
});
