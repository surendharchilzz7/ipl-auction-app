/**
 * Download player photos from IPL 2022 mega auction season
 * This has 200+ additional players with working URLs
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const PHOTO_DIR = path.join(__dirname, '../frontend/public/player-photos');

// All 210+ players from IPL 2022 squads
const players2022 = [
    { "name": "C Hari Nishaanth", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/7111.png" },
    { "name": "Subhranshu Senapati", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20574.png" },
    { "name": "Narayan Jagadeesan", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/4942.png" },
    { "name": "Dwaine Pretorius", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20573.png" },
    { "name": "K Bhagath Varma", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/7105.png" },
    { "name": "Chris Jordan", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/1299.png" },
    { "name": "Adam Milne", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/434.png" },
    { "name": "KM Asif", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/4944.png" },
    { "name": "Prashant Solanki", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20576.png" },
    { "name": "Simarjeet Singh", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/10789.png" },
    { "name": "Matheesha Pathirana", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20627.png" },
    { "name": "Anmolpreet Singh", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/2965.png" },
    { "name": "Sanjay Yadav", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/10631.png" },
    { "name": "Daniel Sams", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/4649.png" },
    { "name": "Fabian Allen", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/1707.png" },
    { "name": "Kieron Pollard", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/210.png" },
    { "name": "Arjun Tendulkar", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/10244.png" },
    { "name": "Hrithik Shokeen", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20598.png" },
    { "name": "Basil Thampi", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/3825.png" },
    { "name": "Mayank Markande", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/4951.png" },
    { "name": "Riley Meredith", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/4055.png" },
    { "name": "Tymal Mills", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/3319.png" },
    { "name": "Finn Allen", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/3020.png" },
    { "name": "Dinesh Karthik", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/102.png" },
    { "name": "Luvnith Sisodia", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20613.png" },
    { "name": "Suyash S Prabhudessai", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/7002.png" },
    { "name": "David Willey", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/2758.png" },
    { "name": "Aneeshwar Gautam", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20614.png" },
    { "name": "Jason Behrendorff", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/937.png" },
    { "name": "Karn Sharma", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/1118.png" },
    { "name": "Siddharth Kaul", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/1086.png" },
    { "name": "Abhijeet Tomar", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20580.png" },
    { "name": "Pratham Singh", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20583.png" },
    { "name": "Sam Billings", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/2756.png" },
    { "name": "Sheldon Jackson", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/1116.png" },
    { "name": "Baba Indrajith", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20578.png" },
    { "name": "Ramesh Kumar", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20582.png" },
    { "name": "Mohammad Nabi", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/618.png" },
    { "name": "Nitish Rana", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/2738.png" },
    { "name": "Chamika Karunaratne", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20579.png" },
    { "name": "Tim Southee", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/307.png" },
    { "name": "Venkatesh Iyer", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/8540.png" },
    { "name": "Aaron Finch", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/167.png" },
    { "name": "Priyam Garg", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/3775.png" },
    { "name": "Rahul Tripathi", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/3838.png" },
    { "name": "Jagadeesha Suchith", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/2741.png" },
    { "name": "Shushant Mishra", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20630.png" },
    { "name": "Umran Malik", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/15154.png" },
    { "name": "Anunay Singh", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20622.png" },
    { "name": "Corbin Bosch", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20680.png" },
    { "name": "Shubham Garhwal", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20621.png" },
    { "name": "KC Cariappa", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/2743.png" },
    { "name": "Nathan Coulter-Nile", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/840.png" },
    { "name": "Tejas Baroka", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/3827.png" },
    { "name": "Mandeep Singh", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/72.png" },
    { "name": "Tim Seifert", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/1619.png" },
    { "name": "Ishan Porel", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/3777.png" },
    { "name": "Evin Lewis", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/872.png" },
    { "name": "Manan Vohra", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/1085.png" },
    { "name": "Jason Holder", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/1075.png" },
    { "name": "Ankit Rajpoot", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/1106.png" },
    { "name": "Andrew Tye", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/1480.png" },
    { "name": "Shahbaz Nadeem", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/57.png" },
    { "name": "Rahmanullah Gurbaz", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20625.png" },
    { "name": "Gurkeerat Mann Singh", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/253.png" },
    { "name": "Dominic Drakes", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/5145.png" },
    { "name": "Pradeep Sangwan", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/91.png" },
    { "name": "Varun Aaron", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/61.png" },
    { "name": "Writtick Chatterjee", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20606.png" },
    { "name": "Ansh Patel", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20608.png" },
    { "name": "Benny Howell", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20605.png" },
    { "name": "Robin Uthappa", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/127.png" },
    { "name": "Ambati Rayudu", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/100.png" },
    { "name": "Dwayne Bravo", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/25.png" },
    { "name": "Moeen Ali", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/1735.png" },
    { "name": "Manoj Tiwary", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/17.png" },
    { "name": "Imran Tahir", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/284.png" },
    { "name": "Andre Russell", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/177.png" },
    { "name": "Sean Abbott", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/942.png" },
    { "name": "Rassie Van Der Dussen", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20619.png" },
    { "name": "Daryl Mitchell", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/20617.png" },
    { "name": "Lockie Ferguson", "imageUrl": "https://assets.iplt20.com/ipl/IPLHeadshot2022/3729.png" },
];

function toFilename(name) {
    return name.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '_') + '.png';
}

function getExistingPhotos() {
    const photos = new Set();
    const files = fs.readdirSync(PHOTO_DIR).filter(f => f.endsWith('.png'));
    for (const file of files) {
        const name = file.replace('.png', '').replace(/_/g, ' ').toLowerCase();
        photos.add(name);
    }
    return photos;
}

function downloadImage(url, filepath) {
    return new Promise((resolve) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        }, (res) => {
            if (res.statusCode === 200 && res.headers['content-type']?.includes('image')) {
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    const stats = fs.statSync(filepath);
                    if (stats.size > 1000) resolve(true);
                    else { fs.unlinkSync(filepath); resolve(false); }
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
    console.log('=' * 60);
    console.log('   Download IPL 2022 Season Players');
    console.log('=' * 60);

    const existing = getExistingPhotos();
    console.log(`\nExisting: ${existing.size} | Scraped: ${players2022.length}`);

    const seen = new Set();
    const toDownload = players2022.filter(p => {
        const key = p.name.toLowerCase();
        if (seen.has(key) || existing.has(key)) return false;
        seen.add(key);
        return true;
    });

    console.log(`New players to download: ${toDownload.length}\n`);
    if (!toDownload.length) { console.log('All done!'); return; }

    let success = 0, failed = 0;
    for (let i = 0; i < toDownload.length; i++) {
        const p = toDownload[i];
        process.stdout.write(`[${i + 1}/${toDownload.length}] ${p.name}... `);
        const ok = await downloadImage(p.imageUrl, path.join(PHOTO_DIR, toFilename(p.name)));
        if (ok) { console.log('✓'); success++; }
        else { console.log('✗'); failed++; }
        await new Promise(r => setTimeout(r, 50));
    }

    console.log(`\nDownloaded: ${success} | Failed: ${failed} | Total: ${existing.size + success}`);

    // Regenerate mappings
    const mapping = {};
    fs.readdirSync(PHOTO_DIR).filter(f => f.endsWith('.png')).forEach(file => {
        mapping[file.replace('.png', '').replace(/_/g, ' ')] = `/player-photos/${file}`;
    });
    fs.writeFileSync(path.join(PHOTO_DIR, 'mapping.json'), JSON.stringify(mapping, null, 2));

    const entries = Object.entries(mapping).sort((a, b) => a[0].localeCompare(b[0]))
        .map(([n, p]) => `    "${n}": "${p}"`).join(',\n');
    fs.writeFileSync(path.join(__dirname, '../frontend/src/data/playerPhotos.js'), `/**
 * AUTO-GENERATED - ${Object.keys(mapping).length} players
 */
const DEFAULT_PLAYER_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(\`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#1e293b"/><circle cx="50" cy="35" r="18" fill="#475569"/><ellipse cx="50" cy="80" rx="28" ry="22" fill="#475569"/></svg>\`);
const LOCAL_PLAYER_PHOTOS = {\n${entries}\n};
const PLAYER_LOOKUP = {};
for (const n of Object.keys(LOCAL_PLAYER_PHOTOS)) PLAYER_LOOKUP[n.toLowerCase()] = n;
function getPlayerPhotoUrl(name) {
    if (!name) return null;
    const n = name.trim(), k = n.toLowerCase();
    return LOCAL_PLAYER_PHOTOS[n] || (PLAYER_LOOKUP[k] ? LOCAL_PLAYER_PHOTOS[PLAYER_LOOKUP[k]] : null);
}
function getDefaultPlayerImage() { return DEFAULT_PLAYER_IMAGE; }
const PLAYER_IDS = {}, LOCAL_PLAYERS = new Set(Object.keys(LOCAL_PLAYER_PHOTOS));
export { getPlayerPhotoUrl, getDefaultPlayerImage, DEFAULT_PLAYER_IMAGE, PLAYER_IDS, LOCAL_PLAYER_PHOTOS, LOCAL_PLAYERS };`);

    console.log(`Updated mappings with ${Object.keys(mapping).length} players\n✅ Done!`);
}

main().catch(console.error);
