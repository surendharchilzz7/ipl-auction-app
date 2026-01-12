
const fs = require('fs');
const path = require('path');

const PHOTOS_DIR = path.join(__dirname, '../frontend/public/player-photos');
const MAPPING_FILE = path.join(PHOTOS_DIR, 'mapping.json');

const SUSPICIOUS_SIZE_THRESHOLD = 3000; // 3KB (XML errors are usually ~1KB)

// Specific players user mentioned to check
const SPECIFIC_CHECKS = ["James Vince", "Ben Duckett", "Tom Banton"];

async function checkPhotos() {
    console.log("Scanning for unsupported/corrupted photos...");

    // Read mapping
    let mapping = {};
    if (fs.existsSync(MAPPING_FILE)) {
        mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
    }

    const files = fs.readdirSync(PHOTOS_DIR).filter(f => f.endsWith('.png'));
    const issues = [];
    const specificStatus = {};

    for (const file of files) {
        const filePath = path.join(PHOTOS_DIR, file);
        const stats = fs.statSync(filePath);
        const name = file.replace(/_/g, ' ').replace('.png', '');

        // Check size
        if (stats.size < SUSPICIOUS_SIZE_THRESHOLD) {
            issues.push({ name, file, size: stats.size, reason: "Too small (suspected XML/Error)" });
        }

        // Check specific requests
        if (SPECIFIC_CHECKS.some(check => name.includes(check))) {
            specificStatus[name] = { file, size: stats.size, status: "Found" };
            // Add to issues if not already there (user explicitly asked about them, implies they might be bad)
            if (!issues.find(i => i.name === name)) {
                issues.push({ name, file, size: stats.size, reason: "User requested check" });
            }
        }
    }

    // Check if specific players are missing from files entirely
    SPECIFIC_CHECKS.forEach(name => {
        const fileV1 = name.replace(/ /g, '_') + '.png';
        if (!files.includes(fileV1)) {
            issues.push({ name, file: "Missing", size: 0, reason: "File not found" });
        }
    });

    console.log("\n--- Potential Issues Found ---");
    issues.sort((a, b) => a.name.localeCompare(b.name)).forEach(i => {
        console.log(`[${i.name}] Reason: ${i.reason} (Size: ${i.size} bytes)`);
    });

    if (issues.length === 0) {
        console.log("No obvious small file issues found.");
    }
}

checkPhotos();
