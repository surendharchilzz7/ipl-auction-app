
const fs = require('fs');
const path = require('path');

const PHOTOS_DIR = path.join(__dirname, '../frontend/public/player-photos');
const MAPPING_FILE = path.join(PHOTOS_DIR, 'mapping.json');

// 1. Identify and Delete Invalid Files
console.log("Scanning for invalid files...");
const files = fs.readdirSync(PHOTOS_DIR).filter(f => !f.startsWith('.'));
let deletedCount = 0;

files.forEach(file => {
    const filepath = path.join(PHOTOS_DIR, file);
    if (fs.lstatSync(filepath).isDirectory()) return;
    if (file.endsWith('.json') || file.endsWith('.js')) return;

    let isInvalid = false;
    const stats = fs.statSync(filepath);

    if (stats.size < 1000) {
        isInvalid = true; // Too small to be a real headshot
    } else {
        // Check header
        try {
            const buffer = Buffer.alloc(4);
            const fd = fs.openSync(filepath, 'r');
            fs.readSync(fd, buffer, 0, 4, 0);
            fs.closeSync(fd);
            const sig = buffer.toString('hex');

            // Allow PNG, JPG, WebP
            if (!sig.startsWith('8950') && !sig.startsWith('ffd8') && !sig.startsWith('5249')) {
                isInvalid = true;
            }
        } catch (e) {
            isInvalid = true;
        }
    }

    if (isInvalid) {
        console.log(`Deleting invalid file: ${file} (${stats.size} bytes)`);
        fs.unlinkSync(filepath);
        deletedCount++;
    }
});
console.log(`Deleted ${deletedCount} invalid files.`);

// 2. Clean Mapping.json
console.log("\nCleaning mapping.json...");
if (fs.existsSync(MAPPING_FILE)) {
    let mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
    let removedCount = 0;
    const cleanMapping = {};

    Object.entries(mapping).forEach(([name, refPath]) => {
        // refPath e.g. "/player-photos/Name.png"
        const filename = path.basename(refPath);
        const localPath = path.join(PHOTOS_DIR, filename);

        if (fs.existsSync(localPath)) {
            cleanMapping[name] = refPath;
        } else {
            console.log(`Removing missing link: ${name} -> ${filename}`);
            removedCount++;
        }
    });

    fs.writeFileSync(MAPPING_FILE, JSON.stringify(cleanMapping, null, 2));
    console.log(`Removed ${removedCount} missing links from mapping.`);
}

console.log("\nNext step: Run regeneratePlayerPhotos.js");
