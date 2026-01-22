
const fs = require('fs');
const path = require('path');
const https = require('https');
const { execSync } = require('child_process');

const LOGOS = {
    DEC: "https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Deccan_Chargers_Logo.svg/1200px-Deccan_Chargers_Logo.svg.png",
    PWI: "https://upload.wikimedia.org/wikipedia/en/thumb/8/81/Pune_Warriors_India_Logo.svg/1200px-Pune_Warriors_India_Logo.svg.png",
    KTK: "https://upload.wikimedia.org/wikipedia/en/thumb/6/60/Kochi_Tuskers_Kerala_Logo.svg/1200px-Kochi_Tuskers_Kerala_Logo.svg.png",
    GL: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Gujarat_Lions_Logo.svg/1200px-Gujarat_Lions_Logo.svg.png",
    RPS: "https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/Rising_Pune_Supergiant_Logo.svg/1200px-Rising_Pune_Supergiant_Logo.svg.png",
    DD: "https://documents.iplt20.com/ipl/DC/Logos/Roundbig/DCroundbig.png"
};

const DEST_DIR = path.join(__dirname, '../../frontend/public/team-logos');

if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
}

async function download(url, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(path.join(DEST_DIR, filename));
        https.get(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded: ${filename}`);
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(path.join(DEST_DIR, filename), () => { });
            console.error(`Error downloading ${filename}:`, err.message);
            reject(err);
        });
    });
}

async function main() {
    console.log("Downloading historical logos...");
    for (const [team, url] of Object.entries(LOGOS)) {
        try {
            await download(url, `${team}.png`);
        } catch (e) {
            console.error(`Failed to download ${team}`);
        }
    }
}

main();
