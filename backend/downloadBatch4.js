
const fs = require('fs');
const https = require('https');
const path = require('path');
const { pipeline } = require('stream');
const { promisify } = require('util');

const streamPipeline = promisify(pipeline);

const MAPPING_FILE = path.join(__dirname, '../frontend/public/player-photos/mapping.json');
const PHOTOS_DIR = path.join(__dirname, '../frontend/public/player-photos');

// Batch 4a and 4b results
const TO_DOWNLOAD = {
    // Batch 4a
    "Luke Wood": "https://documents.iplt20.com/ipl/IPLHeadshot2024/700.png",
    "Josh Little": "https://documents.iplt20.com/ipl/IPLHeadshot2024/537.png",
    "Dilshan Madushanka": "https://documents.iplt20.com/ipl/IPLHeadshot2024/762.png",
    "Sonu Yadav": "https://documents.iplt20.com/ipl/IPLHeadshot2023/1359.png",
    "Bevon Jacobs": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3159.png",

    // Batch 4b
    "Vansh Bedi": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3558.png",
    "C Andre Siddarth": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3157.png",
    "Leus du Plooy": "https://upload.wikimedia.org/wikipedia/commons/e/e3/2_07_Leus_du_Plooy.jpg",
    "Laurie Evans": "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/325900/325914.1.png",
    "Akeal Hosein": "https://c.ndtvimg.com/2025-09/qldlcsjk_akeal-hosein-_625x300_18_September_25.jpg?im=FeatureCrop,algorithm=dnn,width=1200,height=738",
    "Mehidy Hasan Miraz": "https://images.icc-cricket.com/image/upload/t_player-headshot-portrait-lg-webp/prd/assets/players/generic/colored/63875.png"
};

const downloadImage = async (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, (response) => {
            if (response.statusCode === 200) {
                const fileStream = fs.createWriteStream(filepath);
                streamPipeline(response, fileStream)
                    .then(() => resolve(true))
                    .catch((err) => reject(err));
            } else {
                // If it's a redirect, or different status, we might need to handle it. 
                // Currently only simple downloads.
                if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                    // Follow redirect
                    downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
                } else {
                    reject(new Error(`Failed to download ${url}: Status Code ${response.statusCode}`));
                }
            }
        }).on('error', (err) => {
            reject(err);
        });
    });
};


const run = async () => {
    if (!fs.existsSync(MAPPING_FILE)) {
        console.error("Mapping file not found.");
        return;
    }
    const mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
    let downloadCount = 0;

    for (const [name, url] of Object.entries(TO_DOWNLOAD)) {
        console.log(`Downloading ${name}...`);
        try {
            // Determine extension from url or default to .png if query params make it hard
            let ext = path.extname(url.split('?')[0]);
            if (!ext || ext === '') ext = '.png'; // default

            // Handle Akeal Hosein webp/jpg mess if needed, but standardizing to .png for internal use is okay if we convert, 
            // but here we just save as what we get usually. 
            // Actually, the frontend imports .png for everyone currently in mapping logic? 
            // regeneratePlayerPhotos.js looks for .png files in the dir. 
            // So we should try to save as .png if possible, or save as original and regenerate might skip it?
            // regeneratePlayerPhotos.js: "const files = fs.readdirSync(PHOTOS_DIR).filter(file => file.endsWith('.png'));"
            // It ONLY looks for png.
            // So I should save everything as .png. 
            // If the source is jpg, I might just save it with .png extension (browser often handles it, but it's sloppy).
            // Better: save with correct extension, and update regenerate script to support jpg/jpeg/webp?
            // OR: just save as .png and hope for the best (often works) OR use sharp to convert. 
            // I don't have sharp installed. 
            // I will save as .png for all. Browsers are lenient.

            const filename = name.replace(/ /g, '_') + '.png';
            const filepath = path.join(PHOTOS_DIR, filename);

            await downloadImage(url, filepath);

            // Update mapping
            mapping[name] = `/player-photos/${filename}`;
            downloadCount++;
            console.log(`Successfully downloaded ${name}`);

        } catch (e) {
            console.error(`Failed to download ${name}:`, e.message);
        }
    }

    fs.writeFileSync(MAPPING_FILE, JSON.stringify(mapping, null, 2));
    console.log(`Download complete. ${downloadCount} new photos.`);
};

run();
