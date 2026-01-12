/**
 * Download additional player photos from past seasons
 * Only downloads photos for players who don't already have them
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const PHOTO_DIR = path.join(__dirname, '../frontend/public/player-photos');

// Comprehensive list of all players scraped from IPL 2026, 2025, 2024, 2023 seasons
const allScrapedPlayers = [
    // Famous players from past seasons
    { "name": "David Warner", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/214.png" },
    { "name": "Kane Williamson", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/65.png" },
    { "name": "Joe Root", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/312.png" },
    { "name": "Shikhar Dhawan", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/11.png" },
    { "name": "Jonny Bairstow", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/216.png" },
    { "name": "Sam Curran", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/138.png" },
    { "name": "Liam Livingstone", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/183.png" },
    { "name": "Faf du Plessis", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/94.png" },
    { "name": "Ravindra Jadeja", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/46.png" },
    { "name": "Andre Russell", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/141.png" },
    { "name": "Sanju Samson", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/190.png" },
    { "name": "Wanindu Hasaranga", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/377.png" },
    { "name": "Ravichandran Ashwin", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/45.png" },
    { "name": "Quinton de Kock", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/170.png" },
    { "name": "Mohammad Shami", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/47.png" },
    { "name": "Rilee Rossouw", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/1426.png" },
    { "name": "Wriddhiman Saha", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/225.png" },
    { "name": "Matthew Wade", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/549.png" },
    { "name": "Adam Zampa", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/24.png" },
    { "name": "Umesh Yadav", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/21.png" },
    { "name": "Mark Wood", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/315.png" },
    { "name": "Jason Holder", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/263.png" },
    { "name": "Alzarri Joseph", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/229.png" },
    { "name": "Anrich Nortje", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/142.png" },
    { "name": "Jhye Richardson", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/59.png" },
    { "name": "Jake Fraser-McGurk", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/3115.png" },
    { "name": "Chris Woakes", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/314.png" },
    { "name": "Daniel Sams", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/546.png" },
    { "name": "Kyle Jamieson", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/382.png" },
    { "name": "Deepak Hooda", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/215.png" },
    { "name": "Vijay Shankar", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/61.png" },
    { "name": "Rishi Dhawan", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/996.png" },
    { "name": "Lalit Yadav", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/538.png" },
    { "name": "Shai Hope", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/268.png" },
    { "name": "Bhanuka Rajapaksa", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/372.png" },
    { "name": "Ashton Turner", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/86.png" },
    { "name": "Sikandar Raza", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/820.png" },
    { "name": "Gulbadin Naib", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/234.png" },
    { "name": "Krishnappa Gowtham", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/179.png" },
    { "name": "Kyle Mayers", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/726.png" },
    { "name": "Shivam Mavi", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/154.png" },
    { "name": "Naveen Ul Haq", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/639.png" },
    { "name": "Amit Mishra", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/107.png" },
    { "name": "Matt Henry", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/71.png" },
    { "name": "Spencer Johnson", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/2518.png" },
    { "name": "Joshua Little", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/678.png" },
    { "name": "Odean Smith", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/863.png" },
    { "name": "Romario Shepherd", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/371.png" },
    { "name": "Kartik Tyagi", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/536.png" },
    { "name": "Chetan Sakariya", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/592.png" },
    { "name": "Kamlesh Nagarkoti", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/146.png" },
    { "name": "Navdeep Saini", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/207.png" },
    { "name": "Obed McCoy", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/645.png" },
    { "name": "Murugan Ashwin", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/135.png" },
    { "name": "Pradeep Sangwan", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/977.png" },
    { "name": "Fazalhaq Farooqi", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/1011.png" },
    { "name": "Maheesh Theekshana", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/629.png" },
    { "name": "Akash Madhwal", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/1045.png" },
    { "name": "Kumar Kartikeya Singh", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/1015.png" },
    { "name": "Kunal Rathore", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/1540.png" },
    { "name": "Donovan Ferreira", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/2033.png" },
    { "name": "Tom Kohler-Cadmore", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/3113.png" },
    { "name": "Tanush Kotian", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/3118.png" },
    { "name": "Abid Mushtaq", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/1591.png" },
    { "name": "Keshav Maharaj", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/347.png" },
    { "name": "Akash Vashisht", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/1938.png" },
    { "name": "KC Cariappa", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/227.png" },
    { "name": "Kuldip Yadav", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/593.png" },
    { "name": "KM Asif", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/88.png" },
    { "name": "Yash Dhull", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/777.png" },
    { "name": "Swastik Chhikara", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/3102.png" },
    { "name": "Ricky Bhui", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/219.png" },
    { "name": "Vicky Ostwal", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/786.png" },
    { "name": "Sumit Kumar", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/1535.png" },
    { "name": "Lizaad Williams", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/631.png" },
    { "name": "Ripal Patel", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/580.png" },
    { "name": "Sarfaraz Khan", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/139.png" },
    { "name": "Aman Khan", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/979.png" },
    { "name": "Atharva Taide", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/1001.png" },
    { "name": "Harpreet Bhatia", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/1934.png" },
    { "name": "Rahul Chahar", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/171.png" },
    { "name": "Vidwath Kaverappa", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/1564.png" },
    { "name": "Matthew William Short", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/2032.png" },
    { "name": "Baltej Dhanda", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/994.png" },
    { "name": "Mohit Rathee", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/1935.png" },
    { "name": "Manan Vohra", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/185.png" },
    { "name": "Karan Sharma", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/986.png" },
    { "name": "Prince Choudhary", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/3111.png" },
    { "name": "Manvanth Kumar", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3562.png" },
    { "name": "Mohit Sharma", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/100.png" },
    { "name": "Mustafizur Rahman", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/258.png" },
    { "name": "Aryan Juyal", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/990.png" },
    { "name": "Yuvraj Chaudhary", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3564.png" },
    { "name": "Rajvardhan Hangargekar", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/783.png" },
    { "name": "Shardul Thakur", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/105.png" },
    { "name": "Akash Deep", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/1007.png" },
    { "name": "Shamar Joseph", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3105.png" },
    { "name": "Ravi Bishnoi", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/520.png" },
    { "name": "Prerak Mankad", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/998.png" },
    { "name": "BR Sharath", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/3117.png" },
    { "name": "Sandeep Warrier", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/228.png" },
    { "name": "Sushant Mishra", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/1016.png" },
    { "name": "K.S Bharat", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/365.png" },
    { "name": "Aaron Hardie", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/2704.png" },
    { "name": "Josh Inglis", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/647.png" },
    { "name": "Tanay Thyagarajann", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/1491.png" },
    { "name": "Shivam singh", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/1936.png" },
    { "name": "Vishwanath Pratap Singh", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/3110.png" },
    { "name": "Sherfane Rutherford", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/122.png" },
    { "name": "Kusal Mendis", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/276.png" },
    { "name": "Mahipal Lomror", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/184.png" },
    { "name": "Karim Janat", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/247.png" },
    { "name": "Dasun shanaka", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/375.png" },
    { "name": "Gerald Coetzee", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/2535.png" },
    { "name": "Kulwant Khejroliya", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/204.png" },
    { "name": "Abhinav Manohar", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/974.png" },
    { "name": "William O'Rourke", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3398.png" },
    { "name": "Ashok Sharma", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/980.png" },
    { "name": "Abdul P A", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/1542.png" }
];

// Create filename from player name
function toFilename(name) {
    return name.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '_') + '.png';
}

// Get existing photos
function getExistingPhotos() {
    const photos = new Set();
    const files = fs.readdirSync(PHOTO_DIR).filter(f => f.endsWith('.png'));
    for (const file of files) {
        const name = file.replace('.png', '').replace(/_/g, ' ').toLowerCase();
        photos.add(name);
    }
    return photos;
}

// Download image
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        }, (res) => {
            if (res.statusCode === 200 && res.headers['content-type']?.includes('image')) {
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    const stats = fs.statSync(filepath);
                    if (stats.size > 1000) {
                        resolve(true);
                    } else {
                        fs.unlinkSync(filepath);
                        resolve(false);
                    }
                });
            } else {
                file.close();
                if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
                resolve(false);
            }
        }).on('error', () => {
            file.close();
            if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
            resolve(false);
        });
    });
}

async function main() {
    console.log('='.repeat(60));
    console.log('   Download Additional Player Photos (Past Seasons)');
    console.log('='.repeat(60));

    const existing = getExistingPhotos();
    console.log(`\nExisting photos: ${existing.size}`);
    console.log(`All scraped players: ${allScrapedPlayers.length}`);

    // Filter to only new players
    const toDownload = allScrapedPlayers.filter(p => !existing.has(p.name.toLowerCase()));
    console.log(`New players to download: ${toDownload.length}\n`);

    if (toDownload.length === 0) {
        console.log('All players already have photos!');
        return;
    }

    console.log('Downloading new player photos...\n');
    let success = 0;
    let failed = 0;

    for (let i = 0; i < toDownload.length; i++) {
        const player = toDownload[i];
        const filename = toFilename(player.name);
        const filepath = path.join(PHOTO_DIR, filename);

        process.stdout.write(`[${i + 1}/${toDownload.length}] ${player.name}... `);

        const result = await downloadImage(player.imageUrl, filepath);
        if (result) {
            console.log('✓');
            success++;
        } else {
            console.log('✗');
            failed++;
        }

        await new Promise(r => setTimeout(r, 100));
    }

    console.log('\n' + '='.repeat(60));
    console.log(`Downloaded: ${success}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total: ${existing.size + success} photos`);
    console.log('='.repeat(60));

    // Regenerate mapping
    console.log('\nRegenerating mapping files...');

    const mapping = {};
    const files = fs.readdirSync(PHOTO_DIR).filter(f => f.endsWith('.png'));
    for (const file of files) {
        const name = file.replace('.png', '').replace(/_/g, ' ');
        mapping[name] = `/player-photos/${file}`;
    }

    fs.writeFileSync(
        path.join(PHOTO_DIR, 'mapping.json'),
        JSON.stringify(mapping, null, 2)
    );
    console.log(`Updated mapping.json with ${Object.keys(mapping).length} players`);

    // Generate playerPhotos.js
    const entries = Object.entries(mapping)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([name, path]) => `    "${name}": "${path}"`)
        .join(',\n');

    const code = `/**
 * Player Photo URLs - Local Photos with Name-Based Mapping
 * 
 * Photos are stored locally in /player-photos/ directory
 * Mapping is done by player name (case-insensitive)
 * 
 * AUTO-GENERATED - Total: ${Object.keys(mapping).length} players
 */

// Default player silhouette
const DEFAULT_PLAYER_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(\`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <circle cx="50" cy="50" r="50" fill="#1e293b"/>
  <circle cx="50" cy="35" r="18" fill="#475569"/>
  <ellipse cx="50" cy="80" rx="28" ry="22" fill="#475569"/>
</svg>
\`);

// Local player photo mapping - Player Name -> Local Photo Path
const LOCAL_PLAYER_PHOTOS = {
${entries}
};

// Build case-insensitive lookup map
const PLAYER_LOOKUP = {};
for (const name of Object.keys(LOCAL_PLAYER_PHOTOS)) {
    PLAYER_LOOKUP[name.toLowerCase()] = name;
}

/**
 * Get player photo URL by name (case-insensitive)
 * Returns local path if photo exists, null otherwise
 */
function getPlayerPhotoUrl(name) {
    if (!name) return null;

    const normalized = name.trim();
    const nameLower = normalized.toLowerCase();

    // Direct match
    if (LOCAL_PLAYER_PHOTOS[normalized]) {
        return LOCAL_PLAYER_PHOTOS[normalized];
    }

    // Case-insensitive match
    if (PLAYER_LOOKUP[nameLower]) {
        return LOCAL_PLAYER_PHOTOS[PLAYER_LOOKUP[nameLower]];
    }

    // No match found
    return null;
}

function getDefaultPlayerImage() {
    return DEFAULT_PLAYER_IMAGE;
}

// Legacy exports for compatibility
const PLAYER_IDS = {};
const LOCAL_PLAYERS = new Set(Object.keys(LOCAL_PLAYER_PHOTOS));

export {
    getPlayerPhotoUrl,
    getDefaultPlayerImage,
    DEFAULT_PLAYER_IMAGE,
    PLAYER_IDS,
    LOCAL_PLAYER_PHOTOS,
    LOCAL_PLAYERS
};
`;

    fs.writeFileSync(
        path.join(__dirname, '../frontend/src/data/playerPhotos.js'),
        code
    );
    console.log(`Updated playerPhotos.js with ${Object.keys(mapping).length} players`);

    console.log('\n✅ Done!');
}

main().catch(console.error);
