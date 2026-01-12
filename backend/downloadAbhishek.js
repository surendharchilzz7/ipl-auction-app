
const fs = require('fs');
const https = require('https');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');

const streamPipeline = promisify(pipeline);

const PHOTOS_DIR = path.join(__dirname, '../frontend/public/player-photos');
const MAPPING_FILE = path.join(PHOTOS_DIR, 'mapping.json');
const SRC_FILE = path.join(__dirname, '../frontend/src/data/playerPhotos.js');

const TARGET_URL = "https://documents.iplt20.com/ipl/IPLHeadshot2025/212.png";
const TARGET_NAME = "Abhishek Sharma";
const FILENAME = "Abhishek_Sharma.png";

const downloadImage = async (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                const fileStream = fs.createWriteStream(filepath);
                streamPipeline(response, fileStream)
                    .then(() => resolve(true))
                    .catch((err) => reject(err));
            } else {
                reject(new Error(`Failed to download ${url}: Status Code ${response.statusCode}`));
            }
        }).on('error', (err) => {
            reject(err);
        });
    });
};

const run = async () => {
    console.log(`Downloading ${TARGET_NAME} from ${TARGET_URL}...`);
    try {
        await downloadImage(TARGET_URL, path.join(PHOTOS_DIR, FILENAME));
        console.log("Download successful.");

        // Update mapping.json
        if (fs.existsSync(MAPPING_FILE)) {
            const mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
            mapping[TARGET_NAME] = `/player-photos/${FILENAME}`;
            fs.writeFileSync(MAPPING_FILE, JSON.stringify(mapping, null, 2));
            console.log("Updated mapping.json");
        }

    } catch (e) {
        console.error("Error:", e.message);
    }
};

run();
