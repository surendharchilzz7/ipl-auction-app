/**
 * Add Gujarat Lions (GL) and Rising Pune Supergiants (RPS) squads 
 * to 2016 and 2017 season data files.
 * These teams replaced CSK and RR during their 2-year ban.
 */

const fs = require('fs');
const path = require('path');

// Gujarat Lions 2016 Squad
const GL_2016 = [
    "Suresh Raina", "Brendon McCullum", "Aaron Finch", "Dinesh Karthik",
    "Ishan Kishan", "Shubham Agarwal", "Jason Roy",
    "Ravindra Jadeja", "James Faulkner", "Dwayne Bravo", "Dwayne Smith",
    "Shadab Jakati", "Shivil Kaushik", "Eklavya Dwivedi",
    "Dale Steyn", "Praveen Kumar", "Dhawal Kulkarni", "Pradeep Sangwan",
    "Karanveer Singh", "Mehul Patel", "Jaydev Shah"
];

// Rising Pune Supergiants 2016 Squad
const RPS_2016 = [
    "MS Dhoni", "Faf du Plessis", "Ajinkya Rahane", "Kevin Pietersen",
    "George Bailey", "Usman Khawaja", "Saurabh Tiwary",
    "Steven Smith", "Mitchell Marsh", "Thisara Perera", "Irfan Pathan",
    "Baba Aparajith", "Murugan Ashwin", "Ankush Bains",
    "Ashok Dinda", "Rajat Bhatia", "Deepak Chahar", "Ishant Sharma",
    "RP Singh", "Adam Zampa", "Scott Boland", "Albie Morkel"
];

// Gujarat Lions 2017 Squad
const GL_2017 = [
    "Suresh Raina", "Brendon McCullum", "Aaron Finch", "Dinesh Karthik",
    "Ishan Kishan", "Jason Roy", "Chirag Suri",
    "Ravindra Jadeja", "James Faulkner", "Dwayne Bravo", "Dwayne Smith",
    "Shivil Kaushik", "Shadab Jakati", "Pradeep Sangwan",
    "Andrew Tye", "Basil Thampi", "Dhawal Kulkarni", "Manpreet Gony",
    "Munaf Patel", "Jaydev Shah", "Ankit Soni"
];

// Rising Pune Supergiants 2017 Squad
const RPS_2017 = [
    "MS Dhoni", "Ajinkya Rahane", "Steve Smith", "Faf du Plessis",
    "Manoj Tiwary", "Rahul Tripathi", "Mayank Agarwal",
    "Ben Stokes", "Dan Christian", "Mitchell Marsh", "Baba Aparajith",
    "Deepak Chahar", "Washington Sundar", "Adam Zampa",
    "Jaydev Unadkat", "Ashok Dinda", "Shardul Thakur", "Lockie Ferguson",
    "Imran Tahir", "Ankush Bains", "Usman Khawaja", "Ankit Sharma"
];

// Role assignments based on known player roles
const PLAYER_ROLES = {
    // WK
    "MS Dhoni": "WK", "Dinesh Karthik": "WK", "Ishan Kishan": "WK",
    "Saurabh Tiwary": "BAT", "Ankush Bains": "WK",
    // BAT
    "Suresh Raina": "BAT", "Brendon McCullum": "BAT", "Aaron Finch": "BAT",
    "Faf du Plessis": "BAT", "Ajinkya Rahane": "BAT", "Kevin Pietersen": "BAT",
    "George Bailey": "BAT", "Usman Khawaja": "BAT", "Steven Smith": "BAT",
    "Steve Smith": "BAT", "Jason Roy": "BAT", "Chirag Suri": "BAT",
    "Shubham Agarwal": "BAT", "Jaydev Shah": "BAT", "Manoj Tiwary": "BAT",
    "Rahul Tripathi": "BAT", "Mayank Agarwal": "BAT", "Dwayne Smith": "BAT",
    // AR
    "Ravindra Jadeja": "AR", "James Faulkner": "AR", "Dwayne Bravo": "AR",
    "Mitchell Marsh": "AR", "Thisara Perera": "AR", "Irfan Pathan": "AR",
    "Ben Stokes": "AR", "Dan Christian": "AR", "Albie Morkel": "AR",
    "Rajat Bhatia": "AR", "Baba Aparajith": "AR", "Ankit Soni": "AR",
    "Ankit Sharma": "AR", "Stuart Binny": "AR", "Eklavya Dwivedi": "AR",
    "Washington Sundar": "AR",
    // BOWL
    "Dale Steyn": "BOWL", "Praveen Kumar": "BOWL", "Dhawal Kulkarni": "BOWL",
    "Pradeep Sangwan": "BOWL", "Karanveer Singh": "BOWL", "Mehul Patel": "BOWL",
    "Shivil Kaushik": "BOWL", "Shadab Jakati": "BOWL",
    "Ashok Dinda": "BOWL", "Deepak Chahar": "BOWL", "Ishant Sharma": "BOWL",
    "RP Singh": "BOWL", "Adam Zampa": "BOWL", "Scott Boland": "BOWL",
    "Murugan Ashwin": "BOWL", "Andrew Tye": "BOWL", "Basil Thampi": "BOWL",
    "Manpreet Gony": "BOWL", "Munaf Patel": "BOWL",
    "Jaydev Unadkat": "BOWL", "Shardul Thakur": "BOWL", "Lockie Ferguson": "BOWL",
    "Imran Tahir": "BOWL"
};

// Overseas players
const OVERSEAS = new Set([
    "Brendon McCullum", "Aaron Finch", "Kevin Pietersen", "George Bailey",
    "Usman Khawaja", "Steven Smith", "Steve Smith", "Jason Roy", "Chirag Suri",
    "Dale Steyn", "Scott Boland", "James Faulkner", "Dwayne Bravo",
    "Dwayne Smith", "Faf du Plessis", "Mitchell Marsh", "Thisara Perera",
    "Albie Morkel", "Adam Zampa", "Andrew Tye", "Lockie Ferguson",
    "Ben Stokes", "Dan Christian", "David Miller", "Imran Tahir"
]);

function makePlayer(name, team, year) {
    const role = PLAYER_ROLES[name] || "BAT";
    return {
        id: `${name.replace(/[^a-zA-Z]/g, '_')}_${year}`,
        name: name,
        set: role,
        basePrice: 2,
        originalTeam: team,
        overseas: OVERSEAS.has(name) ? true : undefined
    };
}

function addTeamsToSeason(filename, year, glSquad, rpsSquad) {
    const filePath = path.join(__dirname, '..', 'data', 'seasons', filename);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    console.log(`\n=== ${filename} ===`);
    console.log('Before - Teams:', data.teams);
    console.log('Before - Players:', data.players.length);

    // Add GL and RPS to teams list
    if (!data.teams.includes('GL')) data.teams.push('GL');
    if (!data.teams.includes('RPS')) data.teams.push('RPS');

    // Remove CSK and RR if present (they were banned 2016-2017)
    data.teams = data.teams.filter(t => t !== 'CSK' && t !== 'RR');

    // Add GL players
    const glPlayers = glSquad.map(name => makePlayer(name, 'GL', year));
    // Add RPS players
    const rpsPlayers = rpsSquad.map(name => makePlayer(name, 'RPS', year));

    // Remove any existing GL/RPS players (in case script is run multiple times)
    data.players = data.players.filter(p => p.originalTeam !== 'GL' && p.originalTeam !== 'RPS');

    // Add new players
    data.players.push(...glPlayers, ...rpsPlayers);

    console.log('After - Teams:', data.teams);
    console.log('After - Players:', data.players.length);
    console.log('GL players added:', glPlayers.length);
    console.log('RPS players added:', rpsPlayers.length);

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`✅ Saved ${filename}`);
}

// Run
addTeamsToSeason('2016.json', 2016, GL_2016, RPS_2016);
addTeamsToSeason('2017.json', 2017, GL_2017, RPS_2017);

console.log('\n✅ Done! GL and RPS added to 2016 and 2017 seasons.');
