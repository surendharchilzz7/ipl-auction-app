/**
 * Download missing player photos from iplt20.com
 * Quick check - if not found, skip and log
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const PHOTO_DIR = path.join(__dirname, '../../frontend/public/player-photos');

// Missing legendary players that need photos
const MISSING_PLAYERS = [
    "Sourav Ganguly", "Yuvraj Singh", "Shane Warne", "Suresh Raina", "Gautam Gambhir",
    "Dwayne Bravo", "Harbhajan Singh", "Virender Sehwag", "Rahul Dravid", "Anil Kumble",
    "Zaheer Khan", "Lasith Malinga", "Sohail Tanvir", "Jacques Kallis", "Adam Gilchrist",
    "Matthew Hayden", "Brendon McCullum", "Muttiah Muralitharan", "Pragyan Ojha", "RP Singh",
    "Sanath Jayasuriya", "Yusuf Pathan"
];

const downloaded = [];
const notFound = [];

function downloadImage(url, filepath) {
    return new Promise((resolve) => {
        const file = fs.createWriteStream(filepath);
        const req = https.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 5000
        }, (response) => {
            if (response.statusCode === 200 && response.headers['content-type']?.includes('image')) {
                response.pipe(file);
                file.on('finish', () => { file.close(); resolve(true); });
            } else {
                file.close();
                try { fs.unlinkSync(filepath); } catch (e) { }
                resolve(false);
            }
        });
        req.on('error', () => { file.close(); resolve(false); });
        req.on('timeout', () => { req.destroy(); resolve(false); });
    });
}

async function tryDownload(playerName) {
    const slug = playerName.toLowerCase().replace(/ /g, '-');
    const filename = playerName.replace(/ /g, '_') + '.png';
    const filepath = path.join(PHOTO_DIR, filename);

    // Check if already exists
    if (fs.existsSync(filepath)) {
        console.log(`  ${playerName} - Already exists`);
        downloaded.push(playerName);
        return true;
    }

    // Try different URL patterns
    const patterns = [
        `https://documents.iplt20.com/ipl/IPLHeadshot2024/${slug.replace(/-/g, '')}.png`,
        `https://www.iplt20.com/content/dam/iplt20/players/${slug}.png`,
        `https://scores.iplt20.com/ipl/teamplayerimages/${encodeURIComponent(playerName)}.png`,
    ];

    for (const url of patterns) {
        const success = await downloadImage(url, filepath);
        if (success) {
            console.log(`  ${playerName} - Downloaded!`);
            downloaded.push(playerName);
            return true;
        }
    }

    console.log(`  ${playerName} - Not found (SKIPPED)`);
    notFound.push(playerName);
    return false;
}

async function main() {
    console.log('=== DOWNLOADING MISSING PLAYER PHOTOS ===\n');

    for (const player of MISSING_PLAYERS) {
        await tryDownload(player);
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Downloaded/Existing: ${downloaded.length}`);
    console.log(`Not Found: ${notFound.length}`);

    if (notFound.length > 0) {
        console.log('\n=== PLAYERS NEEDING MANUAL DOWNLOAD ===');
        notFound.forEach(p => console.log(`  - ${p}`));
    }
}

main();
