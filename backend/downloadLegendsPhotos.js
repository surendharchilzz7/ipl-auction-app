/**
 * Download player photos from older IPL seasons (2022-2019)
 * Includes legendary players like Chris Gayle, Steve Smith, Ben Stokes, etc.
 * Only downloads photos for players who don't already have them
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const PHOTO_DIR = path.join(__dirname, '../frontend/public/player-photos');

// Legendary players from older IPL seasons (2019-2022)
const oldSeasonPlayers = [
    // Absolute Legends
    { "name": "Chris Gayle", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/236.png" },
    { "name": "AB de Villiers", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/233.png" },
    { "name": "Steve Smith", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/271.png" },
    { "name": "Ben Stokes", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/1154.png" },
    { "name": "Shane Watson", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/227.png" },
    { "name": "Suresh Raina", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/14.png" },
    { "name": "Robin Uthappa", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/127.png" },
    { "name": "Chris Morris", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/836.png" },
    { "name": "Eoin Morgan", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/232.png" },
    { "name": "Dale Steyn", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/260.png" },
    { "name": "Harbhajan Singh", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/5.png" },
    { "name": "Shakib Al Hasan", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/266.png" },

    // 2022 Season Stars
    { "name": "Lockie Ferguson", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/3729.png" },
    { "name": "Daryl Mitchell", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20617.png" },
    { "name": "Rassie Van Der Dussen", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20619.png" },
    { "name": "Varun Aaron", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/61.png" },
    { "name": "Mayank Agarwal", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/158.png" },
    { "name": "Dinesh Karthik", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/102.png" },
    { "name": "Ajinkya Rahane", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/79.png" },
    { "name": "Ambati Rayudu", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/78.png" },
    { "name": "Moeen Ali", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/1546.png" },
    { "name": "Dwayne Bravo", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/143.png" },
    { "name": "Dwaine Pretorius", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/3647.png" },
    { "name": "Mitchell Santner", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/1159.png" },
    { "name": "Chris Jordan", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/1154.png" },
    { "name": "Manoj Tiwary", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/17.png" },
    { "name": "Adam Milne", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/1157.png" },
    { "name": "Mohammad Nabi", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/3089.png" },
    { "name": "Pat Cummins", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/968.png" },
    { "name": "Sam Billings", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/1548.png" },
    { "name": "Umesh Yadav", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/34.png" },
    { "name": "Sheldon Jackson", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/152.png" },
    { "name": "Tim Southee", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/558.png" },
    { "name": "Venkatesh Iyer", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/4681.png" },
    { "name": "Nitish Rana", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/2738.png" },
    { "name": "Andre Russell", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/177.png" },
    { "name": "Kieron Pollard", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/178.png" },
    { "name": "Danny Briggs", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20623.png" },
    { "name": "Tymal Mills", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/1547.png" },
    { "name": "Saurabh Tiwary", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/33.png" },
    { "name": "Jayant Yadav", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/1557.png" },
    { "name": "Glenn Maxwell", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/282.png" },
    { "name": "Shahbaz Ahmed", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/4684.png" },
    { "name": "Wanindu Hasaranga", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/4690.png" },
    { "name": "Josh Hazlewood", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/967.png" },
    { "name": "Harshal Patel", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/3933.png" },
    { "name": "Dinesh Karthik", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/102.png" },
    { "name": "Mohammed Siraj", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/2975.png" },
    { "name": "Aiden Markram", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/3095.png" },
    { "name": "Rahul Tripathi", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/1563.png" },
    { "name": "Priyam Garg", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/5419.png" },
    { "name": "Kartik Tyagi", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/5421.png" },
    { "name": "Bhuvneshwar Kumar", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/285.png" },
    { "name": "T Natarajan", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/3639.png" },
    { "name": "Marco Jansen", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20586.png" },
    { "name": "Sean Abbott", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20622.png" },
    { "name": "Washington Sundar", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/2974.png" },
    { "name": "Anuj Rawat", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20616.png" },
    { "name": "Chama Milind", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20624.png" },
    { "name": "R Samarth", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/3191.png" },
    { "name": "Jason Roy", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/1152.png" },
    { "name": "Tim Seifert", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/3726.png" },
    { "name": "Odean Smith", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/5441.png" },
    { "name": "Benny Howell", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20621.png" },
    { "name": "Liam Livingstone", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/3644.png" },
    { "name": "Rajangad Bawa", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20618.png" },
    { "name": "Shivam Singh", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20660.png" },
    { "name": "Rishi Dhawan", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/161.png" },
    { "name": "Sandeep Sharma", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/155.png" },
    { "name": "Vaibhav Arora", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20625.png" },
    { "name": "Jonny Bairstow", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/1149.png" },
    { "name": "Kagiso Rabada", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/1664.png" },
    { "name": "Anrich Nortje", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/5433.png" },
    { "name": "Shardul Thakur", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/1118.png" },
    { "name": "Mitch Marsh", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/577.png" },
    { "name": "Rovman Powell", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/3085.png" },
    { "name": "Sarfaraz Khan", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/2741.png" },
    { "name": "Khaleel Ahmed", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/4693.png" },
    { "name": "Chetan Sakariya", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/4689.png" },
    { "name": "Kamlesh Nagarkoti", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/3762.png" },
    { "name": "Mandeep Singh", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/135.png" },
    { "name": "KS Bharat", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/1121.png" },
    { "name": "Ripal Patel", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/4686.png" },
    { "name": "Noor Ahmad", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20659.png" },
    { "name": "Lungi Ngidi", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/5434.png" },
    { "name": "Abhinav Manohar", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20657.png" },
    { "name": "Yash Dayal", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20658.png" },
    { "name": "Matthew Wade", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/1549.png" },
    { "name": "Vijay Shankar", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/1119.png" },
    { "name": "Gurkeerat Singh", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/157.png" },
    { "name": "Prabhudessai", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/5439.png" },
    { "name": "Rahmanullah Gurbaz", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20656.png" },
    { "name": "Alzarri Joseph", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/3098.png" },

    // More 2019-2021 Legends
    { "name": "Imran Tahir", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/284.png" },
    { "name": "Lasith Malinga", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/179.png" },
    { "name": "Mitchell McClenaghan", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/835.png" },
    { "name": "Kusal Perera", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/267.png" },
    { "name": "Yusuf Pathan", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/7.png" },
    { "name": "Parthiv Patel", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/18.png" },
    { "name": "Brendon McCullum", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/270.png" },
    { "name": "Chris Lynn", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/832.png" },
    { "name": "Murali Vijay", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/35.png" },
    { "name": "Kedar Jadhav", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/99.png" },
    { "name": "Nathan Coulter-Nile", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/576.png" },
    { "name": "Carlos Brathwaite", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/1153.png" },
    { "name": "Siddhesh Lad", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/1555.png" },
    { "name": "Aditya Tare", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/107.png" },
    { "name": "James Pattinson", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/567.png" },
    { "name": "Dhawal Kulkarni", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/37.png" },
    { "name": "Sherfane Rutherford", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/4447.png" },
    { "name": "Anmolpreet Singh", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/3927.png" },
    { "name": "Anikait Choudhary", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/2739.png" },
    { "name": "Pawan Negi", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/1554.png" },
    { "name": "Isuru Udana", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/274.png" },
    { "name": "Aaron Finch", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/281.png" },
    { "name": "Shahbaz Nadeem", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/103.png" },
    { "name": "Umesh Yadav", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/34.png" },
    { "name": "Monu Kumar", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/1564.png" },
    { "name": "Sam Curran", "imageUrl": "https://documents.iplt20.com/playerheadshot/ipl/210/3645.png" }
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
        const urlModule = url.startsWith('https://assets') ? https : https;
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
    console.log('   Download Legends from IPL 2019-2022 Seasons');
    console.log('='.repeat(60));

    const existing = getExistingPhotos();
    console.log(`\nExisting photos: ${existing.size}`);
    console.log(`Scraped legends: ${oldSeasonPlayers.length}`);

    // Deduplicate and filter to new players only
    const seen = new Set();
    const toDownload = oldSeasonPlayers.filter(p => {
        const key = p.name.toLowerCase();
        if (seen.has(key) || existing.has(key)) return false;
        seen.add(key);
        return true;
    });

    console.log(`New players to download: ${toDownload.length}\n`);

    if (toDownload.length === 0) {
        console.log('All players already have photos!');
        return;
    }

    console.log('Downloading legendary player photos...\n');
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
 * AUTO-GENERATED - Total: ${Object.keys(mapping).length} players
 */

const DEFAULT_PLAYER_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(\`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <circle cx="50" cy="50" r="50" fill="#1e293b"/>
  <circle cx="50" cy="35" r="18" fill="#475569"/>
  <ellipse cx="50" cy="80" rx="28" ry="22" fill="#475569"/>
</svg>
\`);

const LOCAL_PLAYER_PHOTOS = {
${entries}
};

const PLAYER_LOOKUP = {};
for (const name of Object.keys(LOCAL_PLAYER_PHOTOS)) {
    PLAYER_LOOKUP[name.toLowerCase()] = name;
}

function getPlayerPhotoUrl(name) {
    if (!name) return null;
    const normalized = name.trim();
    const nameLower = normalized.toLowerCase();
    if (LOCAL_PLAYER_PHOTOS[normalized]) return LOCAL_PLAYER_PHOTOS[normalized];
    if (PLAYER_LOOKUP[nameLower]) return LOCAL_PLAYER_PHOTOS[PLAYER_LOOKUP[nameLower]];
    return null;
}

function getDefaultPlayerImage() { return DEFAULT_PLAYER_IMAGE; }

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
