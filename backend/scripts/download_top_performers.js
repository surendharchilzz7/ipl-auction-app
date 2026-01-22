/**
 * Quick Photo Downloader for Missing Top Performers
 * Checks iplt20.com first, then skips if not found
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../../frontend/public/player-photos');

// Missing top performers (Orange/Purple Cap winners)
const MISSING_PLAYERS = [
    { name: 'Lasith Malinga', search: 'lasith-malinga', team: 'mumbai-indians', years: [2011, 2013, 2014, 2015] },
    { name: 'Sohail Tanvir', search: 'sohail-tanvir', team: 'rajasthan-royals', years: [2008] },
];

const FOUND = [];
const NOT_FOUND = [];

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 5000
        }, (response) => {
            if (response.statusCode === 200) {
                response.pipe(file);
                file.on('finish', () => { file.close(); resolve(true); });
            } else {
                file.close();
                fs.unlinkSync(filepath);
                resolve(false);
            }
        }).on('error', () => { file.close(); resolve(false); });
    });
}

async function tryIPLT20(player) {
    // Try different URL patterns from iplt20.com
    const patterns = [
        `https://www.iplt20.com/content/dam/iplt20/players/${player.search}.png`,
        `https://scores.iplt20.com/ipl/teamplayerimages/${player.name.replace(/ /g, '%20')}.png`,
    ];

    for (const url of patterns) {
        const filepath = path.join(OUTPUT_DIR, `${player.name.replace(/ /g, '_')}.png`);
        console.log(`  Trying: ${url}`);
        const success = await downloadImage(url, filepath);
        if (success) {
            console.log(`  ✅ Downloaded!`);
            FOUND.push(player.name);
            return true;
        }
    }
    return false;
}

async function main() {
    console.log('=== Downloading Missing Top Performer Photos ===\n');

    for (const player of MISSING_PLAYERS) {
        console.log(`Processing: ${player.name}`);

        const success = await tryIPLT20(player);
        if (!success) {
            console.log(`  ❌ Not found on iplt20.com - SKIPPED`);
            NOT_FOUND.push(player.name);
        }
    }

    console.log('\n=== SUMMARY ===');
    console.log(`Found: ${FOUND.length}`);
    FOUND.forEach(n => console.log(`  ✅ ${n}`));
    console.log(`\nNot Found (need manual download): ${NOT_FOUND.length}`);
    NOT_FOUND.forEach(n => console.log(`  ❌ ${n}`));
}

main();
