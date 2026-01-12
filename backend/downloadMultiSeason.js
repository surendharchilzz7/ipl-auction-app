/**
 * Download missing player photos by trying multiple seasons
 * Tries each player across seasons 2026, 2025, 2024, 2023, 2022 until found
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const PHOTO_DIR = path.join(__dirname, '../frontend/public/player-photos');
const SEASONS = ['2026', '2025', '2024', '2023', '2022'];

// Players with potential IDs to try - will try each season
// IDs are from IPL database - may vary by season
const PLAYERS_TO_FIND = [
    // Format: { name, possibleIds: [id1, id2, ...] }
    // We'll try each ID with each season until we get a valid photo
    { name: "Steve Smith", possibleIds: ["22", "237", "1022"] },
    { name: "Tom Curran", possibleIds: ["325", "139"] },
    { name: "Gus Atkinson", possibleIds: ["3771", "4001"] },
    { name: "Will Jacks", possibleIds: ["828", "3107"] },
    { name: "Mujeeb Ur Rahman", possibleIds: ["390", "180"] },
    { name: "Adil Rashid", possibleIds: ["3775", "3200"] },
    { name: "Harry Brook", possibleIds: ["715", "3100"] },
    { name: "Mark Chapman", possibleIds: ["3122", "3200"] },
    { name: "Alex Carey", possibleIds: ["321", "322"] },
    { name: "Tom Latham", possibleIds: ["3123", "3500"] },
    { name: "Michael Bracewell", possibleIds: ["729", "3009"] },
    { name: "James Neesham", possibleIds: ["330", "184"] },
    { name: "Litton Das", possibleIds: ["392", "600"] },
    { name: "Andre Fletcher", possibleIds: ["351", "126"] },
    { name: "Najibullah Zadran", possibleIds: ["389", "500"] },
    { name: "Ashton Agar", possibleIds: ["317", "318"] },
    { name: "Keemo Paul", possibleIds: ["348", "200"] },
    { name: "Akeal Hosein", possibleIds: ["732", "800"] },
    { name: "Ibrahim Zadran", possibleIds: ["3124", "3600"] },
    { name: "Kusal Perera", possibleIds: ["376", "377"] },
    { name: "Josh Philippe", possibleIds: ["543", "544"] },
    { name: "Chris Green", possibleIds: ["527", "528"] },
    { name: "Shakib Al Hasan", possibleIds: ["267", "268"] },
    { name: "Mehidy Hasan Miraz", possibleIds: ["391", "800"] },
    { name: "Matthew Potts", possibleIds: ["3769", "3800"] },
    { name: "Cooper Connolly", possibleIds: ["3768", "3900"] },
    { name: "Zakary Foulkes", possibleIds: ["3770", "3850"] },
    { name: "Lungi Ngidi", possibleIds: ["387", "276"] },
    { name: "Mohammed Azharuddeen", possibleIds: ["595", "600"] },
    { name: "Mahedi Hasan", possibleIds: ["702", "800"] },
    { name: "Luke Wood", possibleIds: ["713", "714"] },
    { name: "Mayank Dagar", possibleIds: ["594", "990"] },
    { name: "Josh Little", possibleIds: ["713", "917"] },
    { name: "Dilshan Madushanka", possibleIds: ["3118", "3119"] },
    { name: "Sonu Yadav", possibleIds: ["3125", "3126"] },
    { name: "Reece Topley", possibleIds: ["386", "730"] },
    { name: "Piyush Chawla", possibleIds: ["36", "37"] },
    { name: "Abhishek Nair", possibleIds: ["3761", "3762"] },
    { name: "Bevon Jacobs", possibleIds: ["3772", "3773"] },
    { name: "Vansh Bedi", possibleIds: ["3773", "3774"] },
    { name: "C Andre Siddarth", possibleIds: ["3103", "3104"] },
    { name: "Vignesh Puthur", possibleIds: ["3774", "3775"] },
    { name: "Manimaran Siddharth", possibleIds: ["3762", "3763"] },

    // Fix mismatches - force redownload
    { name: "Rahmanullah Gurbaz", possibleIds: ["640", "641", "1015"], isFix: true },
    { name: "Sarfaraz Khan", possibleIds: ["137", "138", "553"], isFix: true }
];

function toFilename(name) {
    return name.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_') + '.png';
}

function checkImageExists(url) {
    return new Promise((resolve) => {
        const req = https.request(url, { method: 'HEAD' }, (res) => {
            resolve(res.statusCode === 200);
        });
        req.on('error', () => resolve(false));
        req.end();
    });
}

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                https.get(response.headers.location, (res) => {
                    if (res.statusCode !== 200) {
                        fs.unlinkSync(filepath);
                        reject(new Error(`Status ${res.statusCode}`));
                        return;
                    }
                    res.pipe(file);
                    file.on('finish', () => { file.close(); resolve(true); });
                }).on('error', (e) => { fs.unlinkSync(filepath); reject(e); });
            } else if (response.statusCode !== 200) {
                fs.unlinkSync(filepath);
                reject(new Error(`Status ${response.statusCode}`));
            } else {
                response.pipe(file);
                file.on('finish', () => { file.close(); resolve(true); });
            }
        }).on('error', (e) => { fs.unlinkSync(filepath); reject(e); });
    });
}

async function findAndDownloadPhoto(player, existing) {
    const filename = toFilename(player.name);
    const filepath = path.join(PHOTO_DIR, filename);

    // Skip if exists (unless it's a fix)
    if (!player.isFix && existing.has(filename.toLowerCase())) {
        return { status: 'skip', name: player.name };
    }

    // Try each ID with each season
    for (const id of player.possibleIds) {
        for (const season of SEASONS) {
            const url = `https://documents.iplt20.com/ipl/IPLHeadshot${season}/${id}.png`;

            try {
                const exists = await checkImageExists(url);
                if (exists) {
                    console.log(`  Found: ${player.name} at ${season}/${id}`);
                    await downloadImage(url, filepath);
                    return { status: 'downloaded', name: player.name, url };
                }
            } catch (e) {
                // Continue to next combination
            }
        }
    }

    return { status: 'notfound', name: player.name };
}

async function main() {
    console.log('=== Multi-Season Photo Download ===\n');

    if (!fs.existsSync(PHOTO_DIR)) {
        fs.mkdirSync(PHOTO_DIR, { recursive: true });
    }

    const existing = new Set(fs.readdirSync(PHOTO_DIR).map(f => f.toLowerCase()));
    console.log(`Existing photos: ${existing.size}\n`);

    const results = { downloaded: [], skipped: [], notfound: [] };

    for (const player of PLAYERS_TO_FIND) {
        console.log(`Checking: ${player.name}...`);
        const result = await findAndDownloadPhoto(player, existing);

        if (result.status === 'downloaded') {
            results.downloaded.push(result.name);
        } else if (result.status === 'skip') {
            results.skipped.push(result.name);
        } else {
            results.notfound.push(result.name);
        }

        // Small delay
        await new Promise(r => setTimeout(r, 100));
    }

    console.log('\n=== Summary ===');
    console.log(`Downloaded: ${results.downloaded.length}`);
    console.log(`Skipped (existing): ${results.skipped.length}`);
    console.log(`Not found: ${results.notfound.length}`);

    if (results.notfound.length > 0) {
        console.log('\nNot found:');
        results.notfound.forEach(n => console.log(`  - ${n}`));
    }

    if (results.downloaded.length > 0) {
        console.log('\nDownloaded:');
        results.downloaded.forEach(n => console.log(`  + ${n}`));
    }
}

main().catch(console.error);
