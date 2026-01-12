
const fs = require('fs');
const path = require('path');

const PHOTOS_DIR = path.join(__dirname, '../frontend/public/player-photos');

// Known good references for comparison (if they exist)
const REFS = ["MS Dhoni", "Virat Kohli"];
const BAD_EXAMPLES = ["James Vince", "Ben Duckett", "Tom Banton"];

// Magic numbers
const SIGNATURES = {
    '89504e47': 'PNG',
    'ffd8ff': 'JPG',
    '52494646': 'WEBP (RIFF)',
    '3c21444f': 'HTML (<!DO)',
    '3c68746d': 'HTML (<htm)',
    '7b0a2020': 'JSON ({ )',
    '3c3f786d': 'XML (<?xm)'
};

function getFileSignature(filepath) {
    try {
        const buffer = Buffer.alloc(4);
        const fd = fs.openSync(filepath, 'r');
        fs.readSync(fd, buffer, 0, 4, 0);
        fs.closeSync(fd);
        return buffer.toString('hex');
    } catch (e) {
        return 'ERROR';
    }
}

async function analyze() {
    console.log("Analyzing Photo Library...\n");

    const files = fs.readdirSync(PHOTOS_DIR).filter(f => f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.webp'));

    // 1. Analyze References
    console.log("--- Reference Files ---");
    REFS.forEach(name => {
        const filename = name.replace(/ /g, '_') + '.png';
        const filepath = path.join(PHOTOS_DIR, filename);
        if (fs.existsSync(filepath)) {
            const stats = fs.statSync(filepath);
            const sig = getFileSignature(filepath);
            const type = SIGNATURES[sig] || 'UNKNOWN';
            console.log(`[GOOD] ${name}: ${stats.size} bytes, Type: ${type} (${sig})`);
        } else {
            console.log(`[REF MISSING] ${name} not found`);
        }
    });

    console.log("\n--- Searching for Issues ---");
    const issues = [];
    const valid = [];

    files.forEach(file => {
        const filepath = path.join(PHOTOS_DIR, file);
        const stats = fs.statSync(filepath);
        const sig = getFileSignature(filepath);
        let type = SIGNATURES[sig] || 'UNKNOWN';

        // Check for WebP disguised as PNG (RIFF header)
        if (sig === '52494646') type = 'WEBP';

        const name = file.replace(/_/g, ' ').replace(/\.(png|jpg|webp)$/, '');
        const isBadExample = BAD_EXAMPLES.some(ex => name.includes(ex));

        let status = 'OK';
        let reason = '';

        if (stats.size < 3000) {
            status = 'BAD';
            reason = 'File too small (<3KB)';
        } else if (type === 'HTML' || type === 'XML' || type === 'JSON') {
            status = 'BAD';
            reason = `Invalid Format (${type})`;
        } else if (type === 'UNKNOWN') {
            // Unknown might be okay, but suspicious
            if (stats.size < 5000) {
                status = 'SUSPICIOUS';
                reason = 'Unknown Header + Small Size';
            }
        }

        if (status !== 'OK' || isBadExample) {
            issues.push({ name, file, size: stats.size, type, reason, isExample: isBadExample });
        } else {
            valid.push({ size: stats.size });
        }
    });

    if (issues.length === 0) {
        console.log("No invalid files found.");
    } else {
        console.log(`Found ${issues.length} potential issues:\n`);
        issues.sort((a, b) => (b.isExample ? 1 : 0) - (a.isExample ? 1 : 0)); // Show examples first

        issues.forEach(i => {
            console.log(`Player: ${i.name}`);
            console.log(`  File: ${i.file}`);
            console.log(`  Size: ${i.size} bytes`);
            console.log(`  Type: ${i.type}`);
            console.log(`  Issue: ${i.reason}`);
            console.log('--------------------------------------------------');
        });
    }

    // Calculate Average Valid Size
    if (valid.length > 0) {
        const avg = valid.reduce((acc, curr) => acc + curr.size, 0) / valid.length;
        console.log(`\nAverage Size of Valid Photos: ${(avg / 1024).toFixed(2)} KB`);
    }
}

analyze();
