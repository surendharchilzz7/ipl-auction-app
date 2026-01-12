/**
 * IPL Player Photo Downloader
 * Downloads player photos from iplt20.com and saves them locally
 * 
 * Run with: node downloadPhotos.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Output directory
const OUTPUT_DIR = path.join(__dirname, '../frontend/public/player-photos');

// All players from the auction CSV
const ALL_PLAYERS = [
    "Virat Kohli", "Rajat Patidar", "Yash Dayal", "Jasprit Bumrah", "Suryakumar Yadav",
    "Hardik Pandya", "Rohit Sharma", "Tilak Varma", "Heinrich Klaasen", "Pat Cummins",
    "Abhishek Sharma", "Travis Head", "Nitish Kumar Reddy", "Ruturaj Gaikwad", "Ravindra Jadeja",
    "Matheesha Pathirana", "Shivam Dube", "MS Dhoni", "Axar Patel", "Kuldeep Yadav",
    "Tristan Stubbs", "Abishek Porel", "Rinku Singh", "Varun Chakravarthy", "Sunil Narine",
    "Andre Russell", "Harshit Rana", "Ramandeep Singh", "Sanju Samson", "Yashasvi Jaiswal",
    "Riyan Parag", "Dhruv Jurel", "Shimron Hetmyer", "Sandeep Sharma", "Rashid Khan",
    "Shubman Gill", "Sai Sudharsan", "Rahul Tewatia", "M Shahrukh Khan", "Nicholas Pooran",
    "Ravi Bishnoi", "Mayank Yadav", "Mohsin Khan", "Ayush Badoni", "Shashank Singh",
    "Prabhsimran Singh", "Jos Buttler", "Shreyas Iyer", "Rishabh Pant", "Kagiso Rabada",
    "Arshdeep Singh", "Mitchell Starc", "Yuzvendra Chahal", "Liam Livingstone", "David Miller",
    "KL Rahul", "Mohammed Shami", "Mohammed Siraj", "Harry Brook", "Devon Conway",
    "Jake Fraser-McGurk", "Aiden Markram", "Devdutt Padikkal", "Rahul Tripathi", "David Warner",
    "Ravichandran Ashwin", "Venkatesh Iyer", "Mitchell Marsh", "Glenn Maxwell", "Harshal Patel",
    "Rachin Ravindra", "Marcus Stoinis", "Jonny Bairstow", "Quinton de Kock", "Rahmanullah Gurbaz",
    "Ishan Kishan", "Phil Salt", "Jitesh Sharma", "Khaleel Ahmed", "Trent Boult",
    "Josh Hazlewood", "Avesh Khan", "Prasidh Krishna", "T Natarajan", "Anrich Nortje",
    "Noor Ahmad", "Rahul Chahar", "Wanindu Hasaranga", "Maheesh Theekshana", "Adam Zampa",
    "Abhinav Manohar", "Karun Nair", "Angkrish Raghuvanshi", "Nehal Wadhera", "Harpreet Brar",
    "Naman Dhir", "Mahipal Lomror", "Sameer Rizvi", "Abdul Samad", "Vijay Shankar",
    "Ashutosh Sharma", "Kumar Kushagra", "Robin Minz", "Anuj Rawat", "Vaibhav Arora",
    "Rasikh Salam", "Akash Madhwal", "Mohit Sharma", "Simarjeet Singh", "Yash Thakur",
    "Vijaykumar Vyshak", "Shreyas Gopal", "Mayank Markande", "Suyash Sharma", "Karn Sharma",
    "Kumar Kartikeya", "Manav Suthar", "Faf du Plessis", "Glenn Phillips", "Rovman Powell",
    "Ajinkya Rahane", "Sam Curran", "Marco Jansen", "Krunal Pandya", "Nitish Rana",
    "Washington Sundar", "Donovan Ferreira", "Josh Inglis", "Ryan Rickelton", "Deepak Chahar",
    "Gerald Coetzee", "Akash Deep", "Tushar Deshpande", "Lockie Ferguson", "Bhuvneshwar Kumar",
    "Mukesh Kumar", "AM Ghazanfar", "Spencer Johnson", "Umran Malik", "Ishant Sharma",
    "Nuwan Thushara", "Jaydev Unadkat", "Manish Pandey", "Sherfane Rutherford", "Shahbaz Ahmed",
    "Moeen Ali", "Tim David", "Deepak Hooda", "Will Jacks", "Azmatullah Omarzai",
    "Sai Kishore", "Romario Shepherd", "Fazalhaq Farooqi", "Kwena Maphaka", "Kuldeep Sen",
    "Reece Topley", "Lizaad Williams", "Priyansh Arya", "Manoj Bhandage", "Praveen Dubey",
    "Ajay Mandal", "Vipraj Nigam", "Ashwani Kumar", "Akash Singh", "Gurjapneet Singh",
    "Mohit Rathee", "Matthew Breetzke", "Mitchell Santner", "Jayant Yadav", "Lungi Ngidi",
    "Jamie Overton", "Xavier Bartlett", "Jacob Bethell", "Brydon Carse", "Aaron Hardie",
    "Kamindu Mendis", "Dushmantha Chameera", "Nathan Ellis", "Shamar Joseph", "Arjun Tendulkar",
    "Zeeshan Ansari", "Manimaran Siddharth", "Digvesh Singh", "Swastik Chikara", "Shubham Dubey",
    "Shaik Rasheed", "Himmat Singh", "Anshul Kamboj", "Arshad Khan", "Darshan Nalkande",
    "Anukul Roy", "Swapnil Singh", "Vansh Bedi", "Kunal Singh Rathore", "Gurnoor Brar",
    "Mukesh Choudhary", "Kamlesh Nagarkoti", "Ramakrishna Ghosh", "Satyanarayana Raju",
    "Bevon Jacobs", "Krishnan Shrijith", "Raj Bawa", "Musheer Khan", "Manvanth Kumar",
    "Suryansh Shedge", "Rajvardhan Hangargekar", "Arshin Kulkarni", "Prince Yadav",
    "Sachin Baby", "Harnoor Singh", "C Andre Siddarth", "Yudhvir Singh", "Aniket Verma",
    "Atharva Taide", "Karim Janat", "Kulwant Khejroliya", "Tripurana Vijay", "Madhav Tiwari",
    "Vignesh Puthur", "Pyla Avinash", "Abhinandan Singh", "Ashok Sharma", "Vaibhav Suryavanshi",
    "Eshan Malinga", "Ben Stokes", "Kane Williamson", "Steve Smith", "Chris Gayle",
    "AB de Villiers", "Kieron Pollard", "Dwayne Bravo", "Brendon McCullum", "Ricky Ponting",
    "Yuvraj Singh", "Gautam Gambhir", "Virender Sehwag", "Suresh Raina", "Zaheer Khan",
    "Shane Watson", "Adam Gilchrist", "Jacques Kallis", "Dale Steyn", "Shane Warne",
    "Sachin Tendulkar", "Rahul Dravid", "Sourav Ganguly", "Anil Kumble", "VVS Laxman",
    "Lasith Malinga", "Timothy Southee", "Daryl Mitchell", "Mujeeb Ur Rahman", "Adil Rashid",
    "Shikhar Dhawan", "Prithvi Shaw", "Shardul Thakur", "Wriddhiman Saha", "Mayank Agarwal",
    "Dinesh Karthik", "Umesh Yadav", "Hashim Amla", "Morne Morkel", "Imran Tahir",
    "Michael Hussey", "Chris Lynn", "Aaron Finch", "Matthew Wade", "Jason Holder",
    "Alzarri Joseph", "Shakib Al Hasan", "Mustafizur Rahman", "Jofra Archer"
];

// Create filename from player name
function createFilename(name) {
    return name.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '_') + '.png';
}

// Check if photo already exists
function photoExists(name) {
    const filename = createFilename(name);
    return fs.existsSync(path.join(OUTPUT_DIR, filename));
}

// Download a single image
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const protocol = url.startsWith('https') ? https : http;
        const file = fs.createWriteStream(filepath);

        protocol.get(url, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve(true);
                });
            } else if (response.statusCode === 301 || response.statusCode === 302) {
                // Follow redirect
                file.close();
                fs.unlinkSync(filepath);
                downloadImage(response.headers.location, filepath)
                    .then(resolve)
                    .catch(reject);
            } else {
                file.close();
                fs.unlinkSync(filepath);
                resolve(false);
            }
        }).on('error', (err) => {
            file.close();
            if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
            resolve(false);
        });
    });
}

// Try multiple URL patterns for IPL photos
async function tryDownloadPlayer(name) {
    const filename = createFilename(name);
    const filepath = path.join(OUTPUT_DIR, filename);

    // URL patterns to try
    const patterns = [
        // IPL official site patterns
        `https://documents.iplt20.com/ipl/IPLHeadshot2024/${encodeURIComponent(name.replace(/ /g, '%20'))}.png`,
        `https://documents.iplt20.com/ipl/IPLHeadshot2025/${encodeURIComponent(name.replace(/ /g, '%20'))}.png`,
        // Different naming conventions
        `https://documents.iplt20.com/ipl/IPLHeadshot2024/${name.replace(/ /g, '')}.png`,
        `https://documents.iplt20.com/ipl/IPLHeadshot2025/${name.replace(/ /g, '')}.png`,
    ];

    for (const url of patterns) {
        const success = await downloadImage(url, filepath);
        if (success) {
            console.log(`✓ Downloaded: ${name}`);
            return true;
        }
    }

    console.log(`✗ Not found: ${name}`);
    return false;
}

// Generate mapping JSON
function generateMapping() {
    const mapping = {};
    const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.png'));

    for (const file of files) {
        // Convert filename back to name
        const name = file.replace('.png', '').replace(/_/g, ' ');
        mapping[name] = `/player-photos/${file}`;
    }

    // Save mapping
    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'mapping.json'),
        JSON.stringify(mapping, null, 2)
    );

    console.log(`\nGenerated mapping.json with ${Object.keys(mapping).length} players`);
    return mapping;
}

// Main function
async function main() {
    console.log('='.repeat(50));
    console.log('IPL Player Photo Downloader');
    console.log('='.repeat(50));

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Count existing photos
    const existing = ALL_PLAYERS.filter(name => photoExists(name));
    const toDownload = ALL_PLAYERS.filter(name => !photoExists(name));

    console.log(`\nExisting photos: ${existing.length}`);
    console.log(`To download: ${toDownload.length}`);
    console.log('\nStarting downloads...\n');

    let downloaded = 0;
    let failed = 0;

    for (const name of toDownload) {
        const success = await tryDownloadPlayer(name);
        if (success) downloaded++;
        else failed++;

        // Small delay between requests
        await new Promise(r => setTimeout(r, 100));
    }

    console.log('\n' + '='.repeat(50));
    console.log(`Downloaded: ${downloaded}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total photos: ${existing.length + downloaded}`);

    // Generate updated mapping
    generateMapping();

    console.log('\nDone! Check frontend/public/player-photos/');
}

main().catch(console.error);
