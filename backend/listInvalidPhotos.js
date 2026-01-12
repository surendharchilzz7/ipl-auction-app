
const fs = require('fs');
const path = require('path');

const PHOTOS_DIR = path.join(__dirname, '../frontend/public/player-photos');

function getFileSignature(filepath) {
    try {
        const buffer = Buffer.alloc(4);
        const fd = fs.openSync(filepath, 'r');
        fs.readSync(fd, buffer, 0, 4, 0);
        fs.closeSync(fd);
        return buffer.toString('hex');
    } catch (e) {
        return '';
    }
}

const files = fs.readdirSync(PHOTOS_DIR).filter(f => !f.startsWith('.'));
const invalid = [];

files.forEach(file => {
    const filepath = path.join(PHOTOS_DIR, file);
    if (fs.lstatSync(filepath).isDirectory()) return;

    // Skip JSON/JS
    if (file.endsWith('.json') || file.endsWith('.js')) return;

    const sig = getFileSignature(filepath);

    // Check if it's NOT a valid image header
    // PNG: 89504e47, JPG: ffd8ff, WebP: 52494646
    const isImage = sig.startsWith('8950') || sig.startsWith('ffd8') || sig.startsWith('5249');

    if (!isImage) {
        // Double check it's not some other valid format, but likely HTML/XML
        const contents = fs.readFileSync(filepath, { encoding: 'utf8', flag: 'r' });
        const preview = contents.substring(0, 20).replace(/\n/g, '');
        invalid.push({ file, preview, size: fs.statSync(filepath).size });
    }
});

console.log(`Found ${invalid.length} invalid files (HTML/XML/Text saved as images):`);
invalid.forEach(i => console.log(`- ${i.file} (${i.size} bytes) [Header: ${i.preview}]`));
