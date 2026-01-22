const fs = require('fs');
const path = require('path');
const axios = require('axios');

const LOGOS_DIR = path.join(__dirname, '../../frontend/public/logos');
if (!fs.existsSync(LOGOS_DIR)) fs.mkdirSync(LOGOS_DIR, { recursive: true });

const LOGOS = {
    DEC: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/09/Deccan_Chargers_Logo.svg/1200px-Deccan_Chargers_Logo.svg.png',
    PWI: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/81/Pune_Warriors_India_Logo.svg/1200px-Pune_Warriors_India_Logo.svg.png',
    KTK: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/60/Kochi_Tuskers_Kerala_Logo.svg/1200px-Kochi_Tuskers_Kerala_Logo.svg.png',
    GL: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a2/Gujarat_Lions_Logo.svg/1200px-Gujarat_Lions_Logo.svg.png',
    RPS: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8b/Rising_Pune_Supergiant_Logo.svg/1200px-Rising_Pune_Supergiant_Logo.svg.png'
};

async function downloadLogos() {
    console.log('Downloading logos...');
    for (const [key, url] of Object.entries(LOGOS)) {
        const filePath = path.join(LOGOS_DIR, `${key}.png`);
        try {
            const response = await axios({
                url,
                responseType: 'stream',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                }
            });

            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });
            console.log(`Downloaded ${key}.png`);
        } catch (error) {
            console.error(`Failed to download ${key}:`, error.message);
        }
    }
    console.log('Done.');
}

downloadLogos();
