
const fs = require('fs');
const path = require('path');

const PHOTOS_DIR = path.join(__dirname, '../frontend/public/player-photos');

const BAD_EXAMPLES = ["James Vince", "Ben Duckett", "Tom Banton", "MS Dhoni"];

function getFileSignature(filepath) {
    try {
        const buffer = Buffer.alloc(8); // Read 8 bytes
        const fd = fs.openSync(filepath, 'r');
        fs.readSync(fd, buffer, 0, 8, 0);
        fs.closeSync(fd);
        return buffer.toString('hex');
    } catch (e) {
        return 'ERROR: ' + e.message;
    }
}

async function inspect() {
    console.log("Inspecting Specific Files...\n");

    const issues = [];

    // 1. Check Specific Examples
    BAD_EXAMPLES.forEach(name => {
        const filename = name.replace(/ /g, '_') + '.png';
        const filepath = path.join(PHOTOS_DIR, filename);

        console.log(`Checking ${name} (${filename})...`);

        if (!fs.existsSync(filepath)) {
            console.log(`  [MISSING] File not found`);
            issues.push({ name, reason: 'Missing' });
            return;
        }

        const stats = fs.statSync(filepath);
        const sig = getFileSignature(filepath);
        console.log(`  Size: ${stats.size} bytes`);
        console.log(`  Signature: ${sig}`);

        let diagnosis = "OK";
        if (stats.size === 0) diagnosis = "EMPTY FILE";
        else if (stats.size < 3000) diagnosis = "TOO SMALL";
        else if (!sig.startsWith('89504e47')) diagnosis = "NOT A PNG";

        console.log(`  Diagnosis: ${diagnosis}`);
        if (diagnosis !== "OK") {
            issues.push({ name, reason: diagnosis });
        }
    });

    console.log("\n--- Full Directory Scan for Non-Images ---");
    const files = fs.readdirSync(PHOTOS_DIR);
    let nonImages = 0;
    files.forEach(file => {
        // Skip dotfiles
        if (file.startsWith('.')) return;

        const filepath = path.join(PHOTOS_DIR, file);
        if (fs.lstatSync(filepath).isDirectory()) return;

        // Skip json/js
        if (file.endsWith('.json') || file.endsWith('.js')) return;

        const sig = getFileSignature(filepath);
        // XML/HTML signatures
        if (sig.startsWith('3c21') || sig.startsWith('3c68') || sig.startsWith('3c3f') || sig.startsWith('7b0a')) {
            console.log(`[INVALID FORMAT] ${file} (Sig: ${sig.substring(0, 8)}...)`);
            nonImages++;
            issues.push({ name: file, reason: 'Invalid Format (HTML/XML/JSON)' });
        }
    });

    if (nonImages === 0) console.log("No obvious HTML/XML files found disguised as images.");
}

inspect();
