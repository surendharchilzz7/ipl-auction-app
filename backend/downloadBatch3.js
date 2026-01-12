const https = require('https');
const fs = require('fs');
const path = require('path');

const PHOTO_DIR = path.join(__dirname, '../frontend/public/player-photos');

// Map of Name -> URL
const PHOTOS_TO_DOWNLOAD = {
    "Andre Fletcher": "https://www.indiafantasy.com/wp-content/uploads/Andre-Fletcher-IPL-740x392.jpg",
    "Najibullah Zadran": "https://media.gettyimages.com/id/1713362606/photo/guwahati-india-najibullah-zadran-of-afghanistan-poses-for-a-portrait-ahead-of-the-icc-mens.jpg",
    "Ashton Agar": "https://media.crictracker.com/media/attachments/2016/01/Ashton-Agar-of-the-Scorchers-GettyImages.jpg",
    "Akeal Hosein": "https://lookaside.fbsbx.com/lookaside/crawler/instagram/DSUnSSEgehX/0/image.jpg",
    "Chris Green": "https://documents.iplt20.com/playerheadshot/ipl/284/3803.png",
    "Mehidy Hasan Miraz": "https://media.gettyimages.com/id/2200102917/photo/dubai-united-arab-emirates-mehidy-hasan-miraz-of-bangladesh-poses-for-a-portrait-during-the.jpg",
    "Matthew Potts": "https://upload.wikimedia.org/wikipedia/commons/a/a8/2_14_Matthew_Potts_mugshot.jpg",
    "Cooper Connolly": "https://resources.cricket-australia.pulselive.com/cricket-australia/photo/2024/07/16/9fa45aeb-1ec1-4da1-b970-b63c11221e41/qnwPOgsG.jpg",
    "Zakary Foulkes": "https://lookaside.fbsbx.com/lookaside/crawler/instagram/DSVHMuKgYBY/0/image.jpg",
    "Mahedi Hasan": "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/380200/380237.1.png"
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
