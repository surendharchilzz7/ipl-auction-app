const https = require('https');
const fs = require('fs');
const path = require('path');

const PHOTO_DIR = path.join(__dirname, '../frontend/public/player-photos');

// Map of Name -> URL
const PHOTOS_TO_DOWNLOAD = {
    "Steve Smith": "https://documents.iplt20.com/playerheadshot/ipl/284/271.png",
    "Harry Brook": "https://documents.iplt20.com/ipl/IPLHeadshot2024/1218.png",
    "Mark Chapman": "https://www.nzc.nz/media/5e4p1g5e/mark-chapman_01.jpg"
};

function toFilename(name) {
    return name.replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_') + '.png';
}

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        const req = https.get(url, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                file.close();
                fs.unlinkSync(filepath);
                downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
                return;
            }
            if (res.statusCode !== 200) {
                file.close();
                fs.unlinkSync(filepath);
                reject(new Error(`Status ${res.statusCode}`));
                return;
            }
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlinkSync(filepath);
            reject(err);
        });
    });
}

async function main() {
    console.log(`Downloading ${Object.keys(PHOTOS_TO_DOWNLOAD).length} photos...`);

    for (const [name, url] of Object.entries(PHOTOS_TO_DOWNLOAD)) {
        if (!url) {
            console.log(`Skipping ${name} (No URL)`);
            continue;
        }

        const filename = toFilename(name);
        const filepath = path.join(PHOTO_DIR, filename);

        try {
            console.log(`Downloading ${name}...`);
            await downloadImage(url, filepath);
            console.log(`✓ Saved to ${filename}`);
        } catch (err) {
            console.error(`✗ Failed ${name}: ${err.message}`);
        }
    }
}

main();
