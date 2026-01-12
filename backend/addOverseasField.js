/**
 * Add overseas field to players_2025.json
 * Marks non-Indian players as overseas: true
 */

const fs = require('fs');
const path = require('path');

const playersPath = path.join(__dirname, 'data/reference/players_2025.json');
const data = JSON.parse(fs.readFileSync(playersPath, 'utf8'));

// Comprehensive list of overseas player names (non-Indian)
const overseasPlayerNames = new Set([
    // Australians
    "Travis Head", "Pat Cummins", "Mitchell Starc", "Josh Hazlewood", "Glenn Maxwell",
    "David Warner", "Steve Smith", "Adam Zampa", "Marcus Stoinis", "Matthew Wade",
    "Josh Inglis", "Tim David", "Spencer Johnson", "Sean Abbott", "Ashton Turner",
    "Nathan Coulter-Nile", "Andrew Tye", "Ben McDermott", "Aaron Finch", "Xavier Bartlett",
    "Mitch Owen", "Jake Fraser-McGurk", "Aaron Hardie", "Matt Henry", "Steve Smith", // NZ/AUS
    "Daniel Sams", "Nathan Ellis", "Jason Behrendorff", "Jhye Richardson",

    // English
    "Liam Livingstone", "Jos Buttler", "Sam Curran", "Ben Stokes", "Jonny Bairstow",
    "Moeen Ali", "Jason Roy", "Chris Woakes", "Jofra Archer", "Harry Brook",
    "Jamie Overton", "Phil Salt", "Tom Curran", "Mark Wood", "Joe Root",
    "Chris Jordan", "Tymal Mills", "Sam Billings", "David Willey", "Adil Rashid",
    "Reece Topley", "Will Jacks", "Richard Gleeson", "Luke Wood", "Tom Kohler-Cadmore",
    "Tom KohlerCadmore", "Gus Atkinson", "George Garton", "Laurie Evans",

    // South Africans
    "Heinrich Klaasen", "Quinton de Kock", "Faf du Plessis", "David Miller",
    "Kagiso Rabada", "Anrich Nortje", "Aiden Markram", "Gerald Coetzee", "Marco Jansen",
    "Tristan Stubbs", "Dewald Brevis", "Lungi Ngidi", "Rassie Van Der Dussen",
    "Dwaine Pretorius", "Ryan Rickelton", "Matthew Breetzke", "Corbin Bosch",
    "Lhuan-dre Pretorius", "Donovan Ferreira", "Lizaad Williams", "Nandre Burger",
    "Wiaan Mulder", "Wayne Parnell", "Tabraiz Shamsi", "Keshav Maharaj",

    // West Indians
    "Nicholas Pooran", "Shimron Hetmyer", "Andre Russell", "Sunil Narine",
    "Rovman Powell", "Jason Holder", "Sherfane Rutherford", "Alzarri Joseph",
    "Romario Shepherd", "Kyle Mayers", "Evin Lewis", "Kieron Pollard",
    "Dwayne Bravo", "Carlos Brathwaite", "Odean Smith", "Shamar Joseph",
    "Obed McCoy", "Fabian Allen", "Roston Chase", "Akeal Hosein",
    "Shai Hope", "Rahkeem Cornwall", "Dominic Drakes", "Jayden Seales",

    // New Zealanders
    "Kane Williamson", "Trent Boult", "Lockie Ferguson", "Devon Conway",
    "Mitchell Santner", "Kyle Jamieson", "Glenn Phillips", "Daryl Mitchell",
    "Tim Southee", "Adam Milne", "Jimmy Neesham", "Tom Latham",
    "Will O'Rourke", "William O'Rourke", "Rachin Ravindra", "Finn Allen",
    "Michael Bracewell", "Ish Sodhi",

    // Afghans
    "Rashid Khan", "Noor Ahmad", "Fazalhaq Farooqi", "Naveen Ul Haq",
    "Mohammad Nabi", "Rahmanullah Gurbaz", "Mujeeb Ur Rahman", "Azmatullah Omarzai",
    "Gulbadin Naib", "Karim Janat", "Allah Ghazanfar", "Qais Ahmad", "Waqar Salamkheil",

    // Sri Lankans
    "Wanindu Hasaranga", "Maheesh Theekshana", "Matheesha Pathirana",
    "Dushmantha Chameera", "Kusal Mendis", "Dasun Shanaka", "Bhanuka Rajapaksa",
    "Kusal Perera", "Chamika Karunaratne", "Dunith Wellalage", "Nuwan Thushara",
    "Dilshan Madushanka", "Vijayakanth Viyaskanth",

    // Bangladeshi
    "Mustafizur Rahman", "Shakib Al Hasan", "Mahmudullah", "Liton Das",
    "Taskin Ahmed", "Shoriful Islam",

    // Zimbabweans
    "Sikandar Raza", "Blessing Muzarabani", "Sean Williams", "Graeme Cremer",

    // Irish
    "Joshua Little", "Paul Stirling", "Harry Tector",

    // Other overseas
    "Imran Tahir", // SA
    "Kwena Maphaka", // SA
    "Keshav Maharaj", // SA
    "Nandre Burger", // SA
]);

// Add overseas field to each player
let overseasCount = 0;
let indianCount = 0;

data.players.forEach(player => {
    // Check if player name is in overseas list
    const isOverseas = overseasPlayerNames.has(player.name);
    player.overseas = isOverseas;

    if (isOverseas) {
        overseasCount++;
    } else {
        indianCount++;
    }
});

// Save updated file
fs.writeFileSync(playersPath, JSON.stringify(data, null, 2));

console.log(`Updated players_2025.json:`);
console.log(`  - Overseas players: ${overseasCount}`);
console.log(`  - Indian players: ${indianCount}`);
console.log(`  - Total: ${data.players.length}`);
