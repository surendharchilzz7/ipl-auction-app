const fs = require('fs');
const path = require('path');

const playersPath = path.join(__dirname, 'data/reference/players_2025.json');
const data = require(playersPath);

const TOP_PLAYERS = [
    "Virat Kohli",
    "MS Dhoni",
    "Rohit Sharma",
    "Jasprit Bumrah",
    "Hardik Pandya",
    "Ravindra Jadeja",
    "Suryakumar Yadav",
    "Rishabh Pant",
    "Sanju Samson",
    "KL Rahul",
    "Shubman Gill",
    "Shreyas Iyer",
    "Pat Cummins",
    "Mitchell Starc",
    "Travis Head",
    "Heinrich Klaasen",
    "Rashid Khan",
    "Andre Russell",
    "Sunil Narine",
    "Nicholas Pooran",
    "Jos Buttler",
    "Yashasvi Jaiswal",
    "Ruturaj Gaikwad",
    "Axar Patel",
    "Kuldeep Yadav",
    "Mohammed Shami",
    "Mohammed Siraj",
    "Arshdeep Singh"
];

let updatedCount = 0;

data.players.forEach(p => {
    if (TOP_PLAYERS.includes(p.name)) {
        // Update base price to 2 if it's less than 2
        if (!p.basePrice || p.basePrice < 2) {
            console.log(`Updating ${p.name}: Base Price ${p.basePrice} -> 2`);
            p.basePrice = 2;
            updatedCount++;
        }
    }
});

fs.writeFileSync(playersPath, JSON.stringify(data, null, 2));
console.log(`Updated ${updatedCount} players.`);
