/**
 * Download missing player photos from IPL website
 * Targets specific players from user's list
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const PHOTO_DIR = path.join(__dirname, '../frontend/public/player-photos');

// Players that need photos - mapped with known IPL headshot IDs from past seasons
// Format: { name, id, season (2026/2025/2024/2023/2022) }
const PLAYERS_TO_DOWNLOAD = [
    // High-profile players with known IDs
    { name: "Steve Smith", id: "22", season: "2024" },
    { name: "Tom Curran", id: "325", season: "2023" },
    { name: "Gus Atkinson", id: "3771", season: "2025" },
    { name: "Will Jacks", id: "828", season: "2024" },
    { name: "Mujeeb Ur Rahman", id: "390", season: "2023" },
    { name: "Adil Rashid", id: "3775", season: "2025" },
    { name: "Harry Brook", id: "715", season: "2023" },
    { name: "Jake Fraser McGurk", id: "3115", season: "2024" },
    { name: "Mark Chapman", id: "3122", season: "2025" },
    { name: "Alex Carey", id: "321", season: "2024" },
    { name: "Tom Latham", id: "3123", season: "2025" },
    { name: "Michael Bracewell", id: "729", season: "2023" },
    { name: "James Neesham", id: "330", season: "2023" },
    { name: "Litton Das", id: "392", season: "2023" },
    { name: "Andre Fletcher", id: "351", season: "2023" },
    { name: "Najibullah Zadran", id: "389", season: "2023" },
    { name: "Ashton Agar", id: "317", season: "2023" },
    { name: "Keemo Paul", id: "348", season: "2022" },
    { name: "Akeal Hosein", id: "732", season: "2023" },
    { name: "Ibrahim Zadran", id: "3124", season: "2025" },
    { name: "Kusal Perera", id: "376", season: "2022" },
    { name: "Josh Philippe", id: "543", season: "2022" },
    { name: "Chris Green", id: "527", season: "2022" },
    { name: "Shakib Al Hasan", id: "267", season: "2024" },
    { name: "Mehidy Hasan Miraz", id: "391", season: "2023" },
    { name: "Matthew Potts", id: "3769", season: "2025" },
    { name: "Cooper Connolly", id: "3768", season: "2025" },
    { name: "Zakary Foulkes", id: "3770", season: "2025" },
    { name: "Lungi Ngidi", id: "387", season: "2024" },
    { name: "Mohammed Azharuddeen", id: "595", season: "2022" },
    { name: "Mahedi Hasan", id: "702", season: "2022" },
    { name: "Luke Wood", id: "713", season: "2023" },
    { name: "Mayank Dagar", id: "594", season: "2023" },
    { name: "Josh Little", id: "713", season: "2023" }, // Check ID
    { name: "Dilshan Madushanka", id: "3118", season: "2024" },
    { name: "Suyash Prabhudessai", id: "540", season: "2024" },
    { name: "Sonu Yadav", id: "3125", season: "2025" },
    { name: "Reece Topley", id: "386", season: "2023" },
    { name: "Piyush Chawla", id: "36", season: "2023" },
    { name: "Siddarth Kaul", id: "179", season: "2022" },
    { name: "Abhishek Nair", id: "3761", season: "2025" },
    { name: "Bevon Jacobs", id: "3772", season: "2025" },
    { name: "Vansh Bedi", id: "3773", season: "2025" },
    { name: "C Andre Siddarth", id: "3103", season: "2025" },
    { name: "Vignesh Puthur", id: "3774", season: "2025" },
    { name: "Tilak Varma", id: "578", season: "2024" },
    { name: "Abhishek Sharma", id: "538", season: "2024" },
    { name: "Manimaran Siddharth", id: "3762", season: "2025" },
    { name: "Varun Chakravarthy", id: "544", season: "2024" },

    // Special cases - fix mismatches
    { name: "Rahmanullah Gurbaz", id: "640", season: "2024", isFix: true },
    { name: "Sarfaraz Khan", id: "137", season: "2024", isFix: true }
];

function toFilename(name) {
    return name.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_') + '.png';
}

function getExistingPhotos() {
    if (!fs.existsSync(PHOTO_DIR)) {
        fs.mkdirSync(PHOTO_DIR, { recursive: true });
        return new Set();
    }
    const files = fs.readdirSync(PHOTO_DIR);
    return new Set(files.map(f => f.toLowerCase()));
}

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                // Handle redirect
                https.get(response.headers.location, (res) => {
                    if (res.statusCode !== 200) {
                        reject(new Error(`Status ${res.statusCode}`));
                        return;
                    }
                    res.pipe(file);
                    file.on('finish', () => {
                        file.close();
                        resolve(true);
                    });
                }).on('error', reject);
            } else if (response.statusCode !== 200) {
                reject(new Error(`Status ${response.statusCode}`));
            } else {
                response.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve(true);
                });
            }
        }).on('error', reject);
    });
}

async function main() {
    console.log('=== Downloading Missing Player Photos ===\n');

    const existing = getExistingPhotos();
    console.log(`Found ${existing.size} existing photos\n`);

    let downloaded = 0;
    let skipped = 0;
    let failed = 0;
    const failures = [];

    for (const player of PLAYERS_TO_DOWNLOAD) {
        const filename = toFilename(player.name);
        const filepath = path.join(PHOTO_DIR, filename);

        // For fixes, always download. Otherwise skip if exists
        if (!player.isFix && existing.has(filename.toLowerCase())) {
            console.log(`SKIP: ${player.name} (already exists)`);
            skipped++;
            continue;
        }

        // Build URL - try IPLHeadshot{season} format
        const url = `https://documents.iplt20.com/ipl/IPLHeadshot${player.season}/${player.id}.png`;

        try {
            console.log(`Downloading: ${player.name}...`);
            await downloadImage(url, filepath);
            console.log(`  ✓ Downloaded: ${filename}`);
            downloaded++;

            // Delay to be polite
            await new Promise(r => setTimeout(r, 300));
        } catch (err) {
            console.log(`  ✗ Failed: ${player.name} - ${err.message}`);
            failures.push({ name: player.name, url, error: err.message });
            failed++;
        }
    }

    console.log('\n=== Summary ===');
    console.log(`Downloaded: ${downloaded}`);
    console.log(`Skipped (existing): ${skipped}`);
    console.log(`Failed: ${failed}`);

    if (failures.length > 0) {
        console.log('\nFailed players:');
        failures.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
    }
}

main().catch(console.error);
