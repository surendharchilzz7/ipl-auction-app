/**
 * Download player photos from iplt20.com using known player IDs
 * Fast batch download without browser
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const PHOTO_DIR = path.join(__dirname, '../../frontend/public/player-photos');

// Player IDs from iplt20.com (found from profile URLs)
const PLAYERS = [
    { name: "Sourav Ganguly", id: 130 },
    { name: "Lasith Malinga", id: 211 },
    { name: "MS Dhoni", id: 1 },
    { name: "Virat Kohli", id: 164 },
    { name: "Rohit Sharma", id: 107 },
    { name: "Sachin Tendulkar", id: 183 },
    { name: "Shane Warne", id: 187 },
    { name: "Yuvraj Singh", id: 52 },
    { name: "Suresh Raina", id: 176 },
    { name: "Gautam Gambhir", id: 49 },
    { name: "Dwayne Bravo", id: 4 },
    { name: "Harbhajan Singh", id: 158 },
    { name: "Virender Sehwag", id: 182 },
    { name: "Rahul Dravid", id: 178 },
    { name: "Anil Kumble", id: 170 },
    { name: "Zaheer Khan", id: 189 },
    { name: "Jacques Kallis", id: 8 },
    { name: "Adam Gilchrist", id: 18 },
    { name: "Matthew Hayden", id: 162 },
    { name: "Brendon McCullum", id: 24 },
    { name: "Muttiah Muralitharan", id: 210 },
    { name: "Pragyan Ojha", id: 73 },
    { name: "RP Singh", id: 58 },
    { name: "Sanath Jayasuriya", id: 209 },
    { name: "Yusuf Pathan", id: 54 },
    { name: "Chris Gayle", id: 7 },
    { name: "AB de Villiers", id: 6 },
    { name: "David Warner", id: 170 },
    { name: "Sohail Tanvir", id: 321 },
];

function downloadImage(url, filepath) {
    return new Promise((resolve) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        }, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => { file.close(); resolve(true); });
            } else {
                file.close();
                try { fs.unlinkSync(filepath); } catch (e) { }
                resolve(false);
            }
        }).on('error', () => { file.close(); resolve(false); });
    });
}

async function downloadPlayer(player) {
    const filename = player.name.replace(/ /g, '_') + '.png';
    const filepath = path.join(PHOTO_DIR, filename);

    // Skip if already exists
    if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        if (stats.size > 1000) {
            console.log(`✓ ${player.name} - Already exists`);
            return true;
        }
    }

    // Try different sizes from iplt20.com
    const sizes = [284, 210, 160];
    for (const size of sizes) {
        const url = `https://documents.iplt20.com/playerheadshot/ipl/${size}/${player.id}.png`;
        const success = await downloadImage(url, filepath);
        if (success) {
            console.log(`✓ ${player.name} - Downloaded (${size}px)`);
            return true;
        }
    }

    console.log(`✗ ${player.name} - NOT FOUND`);
    return false;
}

async function main() {
    console.log('=== DOWNLOADING IPL LEGEND PHOTOS ===\n');

    let downloaded = 0, failed = 0;
    const notFound = [];

    for (const player of PLAYERS) {
        const success = await downloadPlayer(player);
        if (success) downloaded++;
        else { failed++; notFound.push(player.name); }
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Downloaded/Exists: ${downloaded}`);
    console.log(`Not Found: ${failed}`);
    if (notFound.length > 0) {
        console.log('\nMissing:');
        notFound.forEach(n => console.log(`  - ${n}`));
    }
}

main();
