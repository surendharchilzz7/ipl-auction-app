const fs = require('fs');
const path = require('path');

const PHOTOS_JS_PATH = 'e:/auction-app/frontend/src/data/playerPhotos.js';
const PUBLIC_DIR = 'e:/auction-app/frontend/public/player-photos';

// 1. Get list of real files
const realFiles = fs.readdirSync(PUBLIC_DIR);
const realFileSet = new Set(realFiles);

console.log(`Found ${realFiles.length} real photo files.`);

// 2. Read existing JS file
let statsContent = fs.readFileSync(PHOTOS_JS_PATH, 'utf8');

// Extract current map using rudimentary parsing (or require it if we can, but likely ES6 export)
// We will parse the object manually to preserve comments/structure if possible, 
// but rewriting it might be cleaner to ensure sorting.

// Quick regex to find the object block
const startMarker = 'const LOCAL_PLAYER_PHOTOS = {';
const endMarker = '};';
const startIndex = statsContent.indexOf(startMarker);
const endIndex = statsContent.indexOf(endMarker, startIndex);

if (startIndex === -1 || endIndex === -1) {
    console.error("Could not parse LOCAL_PLAYER_PHOTOS object.");
    process.exit(1);
}

const originalMapStr = statsContent.substring(startIndex + startMarker.length, endIndex);
// Parse key-values
const cleanMap = {};
const lines = originalMapStr.split('\n');

for (const line of lines) {
    const match = line.match(/^\s*"(.+)":\s*"(.+)"/);
    if (match) {
        const key = match[1]; // Name
        const val = match[2]; // Path /player-photos/...
        const filename = path.basename(val);

        if (realFileSet.has(filename)) {
            cleanMap[key] = val;
        } else {
            console.log(`Removing broken link: ${key} -> ${val}`);
        }
    } else {
        // preserve comments/aliases if they point to valid files?
        // simple parsing ignores complex lines (comments).
        // User asked to 'remove photos for players who dont have photos', so aliases pointing to missing files should go.
        // We will rebuild aliases manually if needed, or rely on auto-generation.
    }
}

// 3. Add new mappings from real files
let addedCount = 0;
for (const file of realFiles) {
    if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
        // Aaron_Finch.png -> Aaron Finch
        const namePart = path.parse(file).name;
        // Replace underscores with spaces
        let humanName = namePart.replace(/_/g, ' ');

        // Check exact match first
        if (!cleanMap[humanName]) {
            // Also check for case-insensitive
            // But map keys are case sensitive.
            cleanMap[humanName] = `/player-photos/${file}`;
            addedCount++;
        }
    }
}

console.log(`Refined Map Size: ${Object.keys(cleanMap).length} (Added ${addedCount} new)`);

// 4. Sort keys
const sortedKeys = Object.keys(cleanMap).sort();

// 5. Generate new content
let newMapContent = `const LOCAL_PLAYER_PHOTOS = {\n`;
for (let i = 0; i < sortedKeys.length; i++) {
    const key = sortedKeys[i];
    const val = cleanMap[key];
    const comma = i < sortedKeys.length - 1 ? ',' : '';
    newMapContent += `    "${key}": "${val}"${comma}\n`;
}
newMapContent += `};`;

// Replace in original content
const newFileContent = statsContent.substring(0, startIndex) + newMapContent + statsContent.substring(endIndex + endMarker.length);

fs.writeFileSync(PHOTOS_JS_PATH, newFileContent);
console.log("Successfully updated playerPhotos.js");
