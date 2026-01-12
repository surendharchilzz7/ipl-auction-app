
const fs = require('fs');
const path = require('path');

const PHOTOS_DIR = path.join(__dirname, '../frontend/public/player-photos');
const TARGETS = ["James Vince", "Ben Duckett", "Tom Banton"];

console.log("Checking specific targets:");

TARGETS.forEach(name => {
    const filename = name.replace(/ /g, '_') + '.png';
    const filepath = path.join(PHOTOS_DIR, filename);

    if (fs.existsSync(filepath)) {
        const stats = fs.statSync(filepath);
        console.log(`[FOUND] ${filename}`);
        console.log(`  Size: ${stats.size} bytes`);

        try {
            const buffer = Buffer.alloc(8);
            const fd = fs.openSync(filepath, 'r');
            fs.readSync(fd, buffer, 0, 8, 0);
            fs.closeSync(fd);
            console.log(`  Signature: ${buffer.toString('hex')}`);
        } catch (e) { console.log("  Error reading signature"); }

    } else {
        console.log(`[MISSING] ${filename}`);
    }
});
