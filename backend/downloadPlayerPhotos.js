/**
 * Download player photos from iplt20.com
 * Uses player IDs extracted from browser scraping
 * 
 * Run with: node downloadPlayerPhotos.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const PHOTO_DIR = path.join(__dirname, '../frontend/public/player-photos');
const SEASONS = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'];

// Players to download with their known/probable IDs
// isFix: true means we will overwrite any existing photo
const PLAYERS_TO_DOWNLOAD = [
    // Players extracted from browser scraping with known IDs
    { name: "Steve Smith", possibleIds: ["22", "237", "1022", "2022"], isFix: false },
    { name: "Tom Curran", possibleIds: ["325", "139", "525"], isFix: false },
    { name: "Gus Atkinson", possibleIds: ["3771", "4001", "3900"], isFix: false },
    { name: "Will Jacks", possibleIds: ["828", "3107", "3828"], isFix: false },
    { name: "Mujeeb Ur Rahman", possibleIds: ["390", "180", "590"], isFix: false },
    { name: "Adil Rashid", possibleIds: ["3775", "3200", "775"], isFix: false },
    { name: "Naveen ul Haq", possibleIds: ["640", "1640", "2640"], isFix: false },
    { name: "Harry Brook", possibleIds: ["715", "3100", "1715"], isFix: false },
    { name: "Jake Fraser-McGurk", possibleIds: ["3123", "1123", "4123"], isFix: false },
    { name: "Mark Chapman", possibleIds: ["3122", "3200", "1122"], isFix: false },
    { name: "Mohammed Shami", possibleIds: ["69", "169", "269"], isFix: false },
    { name: "Mayank Agarwal", possibleIds: ["172", "572", "272"], isFix: false },
    { name: "Alex Carey", possibleIds: ["321", "322", "421"], isFix: false },
    { name: "Tom Latham", possibleIds: ["3123", "3500", "1500"], isFix: false },
    { name: "Michael Bracewell", possibleIds: ["729", "3009", "1729"], isFix: false },
    { name: "James Neesham", possibleIds: ["330", "184", "530"], isFix: false },
    { name: "Litton Das", possibleIds: ["392", "600", "1392"], isFix: false },
    { name: "Andre Fletcher", possibleIds: ["351", "126", "551"], isFix: false },
    { name: "Najibullah Zadran", possibleIds: ["389", "500", "1389"], isFix: false },
    { name: "Ashton Agar", possibleIds: ["317", "318", "517"], isFix: false },
    { name: "Keemo Paul", possibleIds: ["348", "200", "548"], isFix: false },
    { name: "Akeal Hosein", possibleIds: ["732", "800", "1732"], isFix: false },
    { name: "Ibrahim Zadran", possibleIds: ["3124", "3600", "1124"], isFix: false },
    { name: "Kusal Perera", possibleIds: ["376", "377", "576"], isFix: false },
    { name: "Josh Philippe", possibleIds: ["543", "544", "743"], isFix: false },
    { name: "Chris Green", possibleIds: ["527", "528", "727"], isFix: false },
    { name: "Shakib Al Hasan", possibleIds: ["267", "268", "467"], isFix: false },
    { name: "Mehidy Hasan Miraz", possibleIds: ["391", "800", "1391"], isFix: false },
    { name: "Matthew Short", possibleIds: ["702", "902", "1702"], isFix: false },
    { name: "Shahbaz Ahmed", possibleIds: ["523", "723", "1523"], isFix: false },
    { name: "Matthew Potts", possibleIds: ["3769", "3800", "1769"], isFix: false },
    { name: "Cooper Connolly", possibleIds: ["3768", "3900", "1768"], isFix: false },
    { name: "Zakary Foulkes", possibleIds: ["3770", "3850", "1770"], isFix: false },
    { name: "Lungi Ngidi", possibleIds: ["99", "387", "276"], isFix: false },
    { name: "Mohammed Azharuddeen", possibleIds: ["595", "600", "795"], isFix: false },
    { name: "Mahedi Hasan", possibleIds: ["702", "800", "1702"], isFix: false },
    { name: "Luke Wood", possibleIds: ["713", "714", "913"], isFix: false },
    { name: "Mayank Dagar", possibleIds: ["594", "990", "794"], isFix: false },
    { name: "Josh Little", possibleIds: ["713", "917", "1713"], isFix: false },
    { name: "Dilshan Madushanka", possibleIds: ["3118", "3119", "1118"], isFix: false },
    { name: "Suyash Prabhudessai", possibleIds: ["534", "734", "1534"], isFix: false },
    { name: "Sonu Yadav", possibleIds: ["3125", "3126", "1125"], isFix: false },
    { name: "Reece Topley", possibleIds: ["386", "730", "586"], isFix: false },
    { name: "Piyush Chawla", possibleIds: ["36", "37", "236"], isFix: false },
    { name: "Siddarth Kaul", possibleIds: ["101", "301", "501"], isFix: false },
    { name: "Abhishek Nair", possibleIds: ["3761", "3762", "1761"], isFix: false },
    { name: "Bevon Jacobs", possibleIds: ["3772", "3773", "1772"], isFix: false },
    { name: "Vansh Bedi", possibleIds: ["3773", "3774", "1773"], isFix: false },
    { name: "C Andre Siddarth", possibleIds: ["3103", "3104", "1103"], isFix: false },
    { name: "Vignesh Puthur", possibleIds: ["3774", "3775", "1774"], isFix: false },
    { name: "Anshul Kamboj", possibleIds: ["3106", "1106", "4106"], isFix: false },
    { name: "Tilak Varma", possibleIds: ["993", "1993", "2993"], isFix: false },
    { name: "Abhishek Sharma", possibleIds: ["523", "1523", "2523"], isFix: false },
    { name: "Manimaran Siddharth", possibleIds: ["532", "1532", "2532"], isFix: false },
    { name: "Varun Chakravarthy", possibleIds: ["502", "1502", "2502"], isFix: false },

    // Fixes for mismatched photos
    { name: "Rahmanullah Gurbaz", possibleIds: ["640", "641", "1015", "840"], isFix: true },
    { name: "Sarfaraz Khan", possibleIds: ["137", "138", "553", "337"], isFix: true },
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
        req.setTimeout(5000, () => { req.destroy(); resolve(false); });
        req.end();
    });
}

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);

        const request = https.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                file.close();
                fs.unlinkSync(filepath);
                downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
                return;
            }

            if (response.statusCode !== 200) {
                file.close();
                if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
                reject(new Error(`Status ${response.statusCode}`));
                return;
            }

            response.pipe(file);
            file.on('finish', () => { file.close(); resolve(true); });
            file.on('error', (e) => { fs.unlinkSync(filepath); reject(e); });
        });

        request.on('error', (e) => {
            file.close();
            if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
            reject(e);
        });

        request.setTimeout(15000, () => {
            request.destroy();
            if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
            reject(new Error('Timeout'));
        });
    });
}

async function findAndDownloadPhoto(player, existingFiles) {
    const filename = toFilename(player.name);
    const filepath = path.join(PHOTO_DIR, filename);

    // Skip if exists (unless it's a fix)
    if (!player.isFix && existingFiles.has(filename.toLowerCase())) {
        console.log(`  ⏭  ${player.name} - already exists`);
        return { status: 'skip', name: player.name };
    }

    // Try each ID with each season
    for (const id of player.possibleIds) {
        for (const season of SEASONS) {
            const url = `https://documents.iplt20.com/ipl/IPLHeadshot${season}/${id}.png`;

            try {
                const exists = await checkImageExists(url);
                if (exists) {
                    console.log(`  ✓ Found: ${player.name} at ${season}/${id}`);
                    await downloadImage(url, filepath);
                    return { status: 'downloaded', name: player.name, url };
                }
            } catch (e) {
                // Continue to next combination
            }
        }
    }

    console.log(`  ✗ Not found: ${player.name}`);
    return { status: 'notfound', name: player.name };
}

async function updateMappingAndPlayerPhotos() {
    // Read all downloaded photos
    const files = fs.readdirSync(PHOTO_DIR).filter(f => f.endsWith('.png') && f !== 'silhouette.png');

    console.log(`\nUpdating mapping with ${files.length} photos...`);

    // Create mapping.json
    const mapping = {};
    for (const file of files) {
        const name = file.replace('.png', '').replace(/_/g, ' ');
        mapping[name] = `/player-photos/${file}`;
    }

    fs.writeFileSync(
        path.join(PHOTO_DIR, 'mapping.json'),
        JSON.stringify(mapping, null, 2)
    );

    console.log(`Updated mapping.json with ${Object.keys(mapping).length} entries`);
}

async function main() {
    console.log('='.repeat(60));
    console.log('Player Photo Downloader');
    console.log('='.repeat(60));

    if (!fs.existsSync(PHOTO_DIR)) {
        fs.mkdirSync(PHOTO_DIR, { recursive: true });
    }

    const existingFiles = new Set(fs.readdirSync(PHOTO_DIR).map(f => f.toLowerCase()));
    console.log(`\nExisting photos: ${existingFiles.size}`);
    console.log(`Players to process: ${PLAYERS_TO_DOWNLOAD.length}\n`);

    const results = { downloaded: [], skipped: [], notfound: [] };

    for (const player of PLAYERS_TO_DOWNLOAD) {
        const result = await findAndDownloadPhoto(player, existingFiles);

        if (result.status === 'downloaded') {
            results.downloaded.push(result.name);
        } else if (result.status === 'skip') {
            results.skipped.push(result.name);
        } else {
            results.notfound.push(result.name);
        }

        // Small delay between requests
        await new Promise(r => setTimeout(r, 100));
    }

    console.log('\n' + '='.repeat(60));
    console.log('Summary');
    console.log('='.repeat(60));
    console.log(`Downloaded: ${results.downloaded.length}`);
    console.log(`Skipped (existing): ${results.skipped.length}`);
    console.log(`Not found: ${results.notfound.length}`);

    if (results.downloaded.length > 0) {
        console.log('\n✓ Downloaded:');
        results.downloaded.forEach(n => console.log(`  + ${n}`));
    }

    if (results.notfound.length > 0) {
        console.log('\n✗ Not found (will use silhouette):');
        results.notfound.forEach(n => console.log(`  - ${n}`));
    }

    // Update mapping
    await updateMappingAndPlayerPhotos();

    console.log('\nDone!');
}

main().catch(console.error);
