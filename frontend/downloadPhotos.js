/**
 * Download Player Photos Script
 * 
 * Run with: node downloadPhotos.js
 * Downloads player headshots from IPL website to local folder
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Create output directory
const outputDir = path.join(__dirname, 'public', 'player-photos');
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

// Player name to IPL 2025 Headshot ID mapping
const PLAYER_IDS = {
    // CSK
    "MS Dhoni": 57,
    "Ruturaj Gaikwad": 102,
    "Ravindra Jadeja": 9,
    "Shivam Dube": 211,
    "Matheesha Pathirana": 940,
    "Khaleel Ahmed": 8,
    "Ravichandran Ashwin": 7,
    "Devon Conway": 801,
    "Rahul Tripathi": 127,
    "Rachin Ravindra": 970,
    "Vijay Shankar": 128,
    "Sam Curran": 753,
    "Noor Ahmad": 975,
    "Nathan Ellis": 884,
    "Deepak Hooda": 112,

    // MI
    "Rohit Sharma": 6,
    "Jasprit Bumrah": 117,
    "Suryakumar Yadav": 174,
    "Hardik Pandya": 54,
    "Tilak Varma": 943,
    "Trent Boult": 23,
    "Deepak Chahar": 110,
    "Karn Sharma": 53,
    "Ryan Rickelton": 901,
    "Mitchell Santner": 75,
    "Will Jacks": 977,
    "Arjun Tendulkar": 917,

    // RCB
    "Virat Kohli": 2,
    "Rajat Patidar": 597,
    "Yash Dayal": 949,
    "Phil Salt": 1220,
    "Liam Livingstone": 1112,
    "Jitesh Sharma": 960,
    "Krunal Pandya": 122,
    "Tim David": 892,
    "Romario Shepherd": 958,
    "Josh Hazlewood": 10,
    "Lungi Ngidi": 590,
    "Devdutt Padikkal": 529,

    // KKR
    "Rinku Singh": 874,
    "Sunil Narine": 81,
    "Andre Russell": 85,
    "Varun Chakravarthy": 610,
    "Harshit Rana": 1067,
    "Ramandeep Singh": 1068,
    "Venkatesh Iyer": 921,
    "Quinton de Kock": 78,
    "Rahmanullah Gurbaz": 914,
    "Anrich Nortje": 618,
    "Moeen Ali": 77,
    "Manish Pandey": 35,
    "Ajinkya Rahane": 27,
    "Rovman Powell": 559,
    "Umran Malik": 945,

    // SRH
    "Heinrich Klaasen": 910,
    "Pat Cummins": 18,
    "Abhishek Sharma": 957,
    "Travis Head": 87,
    "Nitish Kumar Reddy": 1186,
    "Ishan Kishan": 164,
    "Mohammed Shami": 21,
    "Harshal Patel": 111,
    "Rahul Chahar": 598,
    "Adam Zampa": 100,
    "Jaydev Unadkat": 109,

    // RR
    "Sanju Samson": 101,
    "Yashasvi Jaiswal": 533,
    "Riyan Parag": 875,
    "Dhruv Jurel": 1087,
    "Shimron Hetmyer": 568,
    "Sandeep Sharma": 119,
    "Jofra Archer": 564,
    "Maheesh Theekshana": 918,
    "Wanindu Hasaranga": 866,
    "Fazalhaq Farooqi": 904,
    "Nitish Rana": 121,

    // DC
    "Axar Patel": 115,
    "Kuldeep Yadav": 116,
    "Tristan Stubbs": 915,
    "Abishek Porel": 1066,
    "KL Rahul": 37,
    "Mitchell Starc": 13,
    "Harry Brook": 893,
    "Jake Fraser-McGurk": 1101,
    "T Natarajan": 583,
    "Mohit Sharma": 39,
    "Faf du Plessis": 12,
    "Karun Nair": 126,
    "Mukesh Kumar": 959,

    // PBKS
    "Shashank Singh": 1063,
    "Prabhsimran Singh": 872,
    "Shreyas Iyer": 52,
    "Arshdeep Singh": 873,
    "Yuzvendra Chahal": 113,
    "Glenn Maxwell": 5,
    "Marcus Stoinis": 96,
    "Lockie Ferguson": 560,
    "Nehal Wadhera": 1069,
    "Harpreet Brar": 920,
    "Marco Jansen": 894,
    "Josh Inglis": 1121,

    // LSG
    "Nicholas Pooran": 563,
    "Ravi Bishnoi": 916,
    "Mayank Yadav": 1085,
    "Mohsin Khan": 955,
    "Ayush Badoni": 927,
    "Rishabh Pant": 68,
    "David Miller": 33,
    "Aiden Markram": 593,
    "Mitchell Marsh": 14,
    "Avesh Khan": 944,
    "Abdul Samad": 913,
    "Shahbaz Ahmed": 956,

    // GT
    "Rashid Khan": 107,
    "Shubman Gill": 530,
    "Sai Sudharsan": 952,
    "Rahul Tewatia": 125,
    "M Shahrukh Khan": 929,
    "Jos Buttler": 17,
    "Kagiso Rabada": 74,
    "Mohammed Siraj": 611,
    "Prasidh Krishna": 601,
    "Anuj Rawat": 953,
    "Ishant Sharma": 4,
    "Washington Sundar": 600,
    "Gerald Coetzee": 1103,
    "Sherfane Rutherford": 586,
    "Glenn Phillips": 556,
    "Jayant Yadav": 114,
    "Mahipal Lomror": 871,

    // Famous International Stars
    "Kane Williamson": 31,
    "Ben Stokes": 19,
    "Jonny Bairstow": 26,
    "Steve Smith": 29,
    "David Warner": 3,
    "Daryl Mitchell": 985,
    "Mujeeb Ur Rahman": 561,
    "Adil Rashid": 103,

    // India Legends
    "Virender Sehwag": 38,
    "Gautam Gambhir": 30,
    "Yuvraj Singh": 40,
    "Suresh Raina": 41,
    "Bhuvneshwar Kumar": 15,
    "Umesh Yadav": 16,
    "Dinesh Karthik": 34,
    "Prithvi Shaw": 527,
    "Shardul Thakur": 118,
    "Wriddhiman Saha": 32,
    "Mayank Agarwal": 123,
    "Shikhar Dhawan": 22,

    // More players
    "Faf Du Plessis": 12,
    "Hashim Amla": 69,
    "Dale Steyn": 72,
    "Morne Morkel": 73,
    "Imran Tahir": 79,
    "Michael Hussey": 84,
    "Chris Lynn": 92,
    "Aaron Finch": 93,
    "Matthew Wade": 95,
    "Chris Gayle": 45,
    "Kieron Pollard": 47,
    "Dwayne Bravo": 48,
    "Jason Holder": 557,
    "Alzarri Joseph": 562,
    "Shakib Al Hasan": 565,
    "Mustafizur Rahman": 566,
};

function sanitizeFilename(name) {
    return name.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '_');
}

function downloadImage(playerName, iplId) {
    return new Promise((resolve, reject) => {
        const url = `https://documents.iplt20.com/ipl/IPLHeadshot2025/${iplId}.png`;
        const filename = sanitizeFilename(playerName) + '.png';
        const filepath = path.join(outputDir, filename);

        // Skip if already exists
        if (fs.existsSync(filepath)) {
            console.log(`[SKIP] ${playerName} already exists`);
            resolve({ name: playerName, status: 'exists', filename });
            return;
        }

        https.get(url, (response) => {
            if (response.statusCode === 200) {
                const file = fs.createWriteStream(filepath);
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    console.log(`[OK] Downloaded ${playerName} (ID: ${iplId})`);
                    resolve({ name: playerName, status: 'downloaded', filename });
                });
            } else if (response.statusCode === 302 || response.statusCode === 301) {
                // Follow redirect
                const redirectUrl = response.headers.location;
                https.get(redirectUrl, (res2) => {
                    if (res2.statusCode === 200) {
                        const file = fs.createWriteStream(filepath);
                        res2.pipe(file);
                        file.on('finish', () => {
                            file.close();
                            console.log(`[OK] Downloaded ${playerName} (ID: ${iplId}) via redirect`);
                            resolve({ name: playerName, status: 'downloaded', filename });
                        });
                    } else {
                        console.log(`[FAIL] ${playerName} - Status: ${res2.statusCode}`);
                        resolve({ name: playerName, status: 'failed', id: iplId });
                    }
                });
            } else {
                console.log(`[FAIL] ${playerName} - Status: ${response.statusCode}`);
                resolve({ name: playerName, status: 'failed', id: iplId });
            }
        }).on('error', (err) => {
            console.log(`[ERROR] ${playerName} - ${err.message}`);
            resolve({ name: playerName, status: 'error', error: err.message });
        });
    });
}

async function downloadAll() {
    console.log('========================================');
    console.log('  IPL Player Photo Downloader');
    console.log(`  Total players: ${Object.keys(PLAYER_IDS).length}`);
    console.log(`  Output: ${outputDir}`);
    console.log('========================================\n');

    const results = { downloaded: 0, exists: 0, failed: 0 };
    const failed = [];

    for (const [name, id] of Object.entries(PLAYER_IDS)) {
        const result = await downloadImage(name, id);
        if (result.status === 'downloaded') results.downloaded++;
        else if (result.status === 'exists') results.exists++;
        else {
            results.failed++;
            failed.push({ name, id });
        }

        // Small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 100));
    }

    console.log('\n========================================');
    console.log('  DOWNLOAD COMPLETE');
    console.log(`  Downloaded: ${results.downloaded}`);
    console.log(`  Already existed: ${results.exists}`);
    console.log(`  Failed: ${results.failed}`);
    console.log('========================================');

    if (failed.length > 0) {
        console.log('\nFailed players:');
        failed.forEach(f => console.log(`  - ${f.name} (ID: ${f.id})`));
    }

    // Generate mapping file for frontend
    const mapping = {};
    for (const name of Object.keys(PLAYER_IDS)) {
        mapping[name] = `/player-photos/${sanitizeFilename(name)}.png`;
    }

    fs.writeFileSync(
        path.join(__dirname, 'public', 'player-photos', 'mapping.json'),
        JSON.stringify(mapping, null, 2)
    );
    console.log('\nGenerated mapping.json');
}

downloadAll();
