/**
 * Check all top IPL performers against existing photos
 * Includes top run scorers and wicket takers from all seasons
 */

const fs = require('fs');
const path = require('path');

const PHOTO_DIR = path.join(__dirname, '../../frontend/public/player-photos');

// Complete list of IPL top performers (Top 3-5 from each category each year)
const TOP_PERFORMERS = [
    // 2008 Top Batsmen
    "Shaun Marsh", "Sanath Jayasuriya", "Sachin Tendulkar", "Yusuf Pathan", "Sourav Ganguly",
    // 2008 Top Bowlers
    "Sohail Tanvir", "Shane Warne", "Pragyan Ojha", "RP Singh", "Muttiah Muralitharan",

    // 2009 Top Batsmen
    "Matthew Hayden", "Adam Gilchrist", "Sachin Tendulkar", "Rohit Sharma", "Yusuf Pathan",
    // 2009 Top Bowlers
    "RP Singh", "Anil Kumble", "Harbhajan Singh", "Pragyan Ojha", "Lasith Malinga",

    // 2010 Top Batsmen
    "Sachin Tendulkar", "Murali Vijay", "Suresh Raina", "Jacques Kallis", "Gautam Gambhir",
    // 2010 Top Bowlers
    "Pragyan Ojha", "Lasith Malinga", "Harbhajan Singh", "Doug Bollinger", "Zaheer Khan",

    // 2011 Top Batsmen
    "Chris Gayle", "Virender Sehwag", "Sachin Tendulkar", "Shaun Marsh", "Gautam Gambhir",
    // 2011 Top Bowlers
    "Lasith Malinga", "Morne Morkel", "Zaheer Khan", "Munaf Patel", "Amit Mishra",

    // 2012 Top Batsmen
    "Chris Gayle", "Gautam Gambhir", "Ajinkya Rahane", "Virat Kohli", "Suresh Raina",
    // 2012 Top Bowlers
    "Morne Morkel", "Sunil Narine", "Shane Watson", "Lasith Malinga", "Piyush Chawla",

    // 2013 Top Batsmen
    "Michael Hussey", "Chris Gayle", "Shane Watson", "Virat Kohli", "Suresh Raina",
    // 2013 Top Bowlers
    "Dwayne Bravo", "James Faulkner", "Sunil Narine", "Ravichandran Ashwin", "Vinay Kumar",

    // 2014 Top Batsmen
    "Robin Uthappa", "Glenn Maxwell", "Virat Kohli", "David Warner", "Suresh Raina",
    // 2014 Top Bowlers
    "Mohit Sharma", "Sunil Narine", "Lasith Malinga", "Amit Mishra", "Ravichandran Ashwin",

    // 2015 Top Batsmen
    "David Warner", "Virat Kohli", "Rohit Sharma", "Brendon McCullum", "Gautam Gambhir",
    // 2015 Top Bowlers
    "Dwayne Bravo", "Andre Russell", "Lasith Malinga", "Piyush Chawla", "Bhuvneshwar Kumar",

    // 2016 Top Batsmen
    "Virat Kohli", "David Warner", "Shikhar Dhawan", "Murali Vijay", "Quinton de Kock",
    // 2016 Top Bowlers
    "Bhuvneshwar Kumar", "Mustafizur Rahman", "Samuel Badree", "Dwayne Bravo", "Shane Watson",

    // 2017 Top Batsmen
    "David Warner", "Shikhar Dhawan", "Robin Uthappa", "KL Rahul", "Gautam Gambhir",
    // 2017 Top Bowlers
    "Bhuvneshwar Kumar", "Jasprit Bumrah", "Rashid Khan", "Imran Tahir", "Yuzvendra Chahal",

    // 2018 Top Batsmen
    "Kane Williamson", "Rishabh Pant", "Ambati Rayudu", "Suresh Raina", "KL Rahul",
    // 2018 Top Bowlers
    "Andrew Tye", "Rashid Khan", "Jasprit Bumrah", "Sunil Narine", "Shardul Thakur",

    // 2019 Top Batsmen
    "David Warner", "KL Rahul", "Quinton de Kock", "Andre Russell", "Jonny Bairstow",
    // 2019 Top Bowlers
    "Imran Tahir", "Kagiso Rabada", "Shreyas Gopal", "Deepak Chahar", "Jasprit Bumrah",

    // 2020 Top Batsmen
    "KL Rahul", "Shikhar Dhawan", "David Warner", "Mayank Agarwal", "Faf du Plessis",
    // 2020 Top Bowlers
    "Kagiso Rabada", "Jasprit Bumrah", "Yuzvendra Chahal", "Anrich Nortje", "Rashid Khan",

    // 2021 Top Batsmen
    "Ruturaj Gaikwad", "KL Rahul", "Faf du Plessis", "Shikhar Dhawan", "Glenn Maxwell",
    // 2021 Top Bowlers
    "Harshal Patel", "Avesh Khan", "Jasprit Bumrah", "Rashid Khan", "Chris Morris",

    // 2022 Top Batsmen
    "Jos Buttler", "KL Rahul", "Quinton de Kock", "Shubman Gill", "Hardik Pandya",
    // 2022 Top Bowlers
    "Yuzvendra Chahal", "Wanindu Hasaranga", "Kagiso Rabada", "Kuldeep Yadav", "Umesh Yadav",

    // 2023 Top Batsmen
    "Shubman Gill", "Faf du Plessis", "Virat Kohli", "Yashasvi Jaiswal", "Devon Conway",
    // 2023 Top Bowlers
    "Mohammed Shami", "Rashid Khan", "Piyush Chawla", "Mohit Sharma", "Tushar Deshpande",

    // 2024 Top Batsmen
    "Virat Kohli", "Ruturaj Gaikwad", "Travis Head", "Riyan Parag", "Suryakumar Yadav",
    // 2024 Top Bowlers
    "Harshal Patel", "Jasprit Bumrah", "T Natarajan", "Varun Chakaravarthy", "Arshdeep Singh",

    // 2025 Top Batsmen
    "Sai Sudharsan", "Jos Buttler", "Shubman Gill", "Nicholas Pooran", "Abhishek Sharma",
    // 2025 Top Bowlers
    "Prasidh Krishna", "Jasprit Bumrah", "Rashid Khan", "Mohammed Shami", "Arshdeep Singh",

    // Legendary players who should definitely have photos
    "MS Dhoni", "AB de Villiers", "Yuvraj Singh", "Rahul Dravid", "Anil Kumble",
    "Shane Warne", "Brendon McCullum", "Adam Gilchrist", "Kevin Pietersen", "Kieron Pollard",
    "Andre Russell", "Hardik Pandya", "Ravindra Jadeja", "Axar Patel", "Dinesh Karthik"
];

// Get unique names
const uniquePlayers = [...new Set(TOP_PERFORMERS)];

// Get existing photo files
const existingPhotos = fs.readdirSync(PHOTO_DIR).map(f => f.replace('.png', '').replace(/_/g, ' '));

const missing = [];
const found = [];

for (const player of uniquePlayers) {
    const normalized = player.toLowerCase();
    const hasPhoto = existingPhotos.some(p => p.toLowerCase() === normalized);
    if (hasPhoto) {
        found.push(player);
    } else {
        missing.push(player);
    }
}

console.log('=== TOP PERFORMERS PHOTO CHECK ===');
console.log(`Total unique players: ${uniquePlayers.length}`);
console.log(`Photos found: ${found.length}`);
console.log(`Photos missing: ${missing.length}`);
console.log('\n=== MISSING PHOTOS ===');
missing.forEach(p => console.log(`  - ${p}`));
