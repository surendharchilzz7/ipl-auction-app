/**
 * Photo Renaming Script
 * Renames mismatched player photos to correct names
 * Uses temp names to avoid conflicts with circular renames
 */

const fs = require('fs');
const path = require('path');

const PHOTO_DIR = path.join(__dirname, '../frontend/public/player-photos');

// Mapping: current filename (without .png) -> correct player name
const corrections = {
    // Format: "Current_Name": "Correct Name"
    "AB_de_Villiers": "Ajinkya Rahane",
    "Adam_Zampa": "Mohit Sharma",
    "Ajinkya_Rahane": "Kuldeep Yadav",
    "Akash_Deep": "Ryle Rickelton",
    "Amit_Mishra": "Mayank Agarwal",
    "Abishek_Porel": "Rajvardhan Hangargekar",
    "Ashwani_Kumar": "Gurnoor Singh Brar",
    "Avesh_Khan": "Jofra Archer",
    "Axar_Patel": "Washington Sundar",
    "Ben_Stokes": "KL Rahul",
    "Brendon_McCullum": "Josh Hazlewood",
    "Chahar": "Axar Patel",
    "Chris_Gayle": "Ravichandran Ashwin",
    "Daryl_Mitchell": "Ayush Badoni",
    "David_Miller": "Pat Cummins",
    "Deepak_Chahar": "Axar Patel",
    "Devon_Conway": "Kwena Maphaka",
    "Faf_du_Plessis": "Shreyas Iyer",
    "Harshal_Patel": "Adam Zampa",
    "Hashim_Amla": "Lockie Ferguson",
    "Heinrich_Klaasen": "Raghu Sharma",
    "Himanshu_Sharma": "Rachin Ravindra",
    "Jadeja": "Jasprit Bumrah",
    "Jasprit_Bumrah": "Khaleel Ahmed",
    "Jayant_Yadav": "Harshal Patel",
    "Jaydev_Unadkat": "Avesh Khan",
    "Jos_Buttler": "Krunal Pandya",
    "Josh_Hazlewood": "Yuzvendra Chahal",
    "Kane_Williamson": "Mitchell Starc",
    "Karun_Nair": "Kusal Mendis",
    "Kieron_Pollard": "Mohammad Shami",
    "KL_Rahul": "Travis Head",
    "Krunal_Pandya": "Sherfane Rutherford",
    "Kuldeep_Yadav": "Kagiso Rabada",
    "Kyle_Mayers": "Venkatesh Iyer",
    "Lasith_Malinga": "Ishant Sharma",
    "Luke_Wood": "Nuwan Thushara",
    "Lungi_Ngidi": "M Shahrukh Khan",
    "Maheesh_Theekshana": "Kamindu Mendis",
    "Manish_Pandey": "Lockie Ferguson",
    "Marco_Jansen": "Rajat Patidar",
    "Mayank_Markande": "Rahul Tripathi",
    "Mitchell_Marsh": "Kuldeep Yadav",
    "Mohammad_Shami": "Faf du Plessis",
    "Mohammed_Shami": "Yuzvendra Chahal",
    "Navdeep_Saini": "Suyash Sharma",
    "Pat_Cummins": "Rishabh Pant",
    "Prasidh_Krishna": "Devon Conway",
    "Prince_Yadav": "Richard Gleeson",
    "Prithvi_Shaw": "Jos Buttler",
    "Pyla_Avinash": "Ramakrishna Ghosh",
    "Rachin_Ravindra": "Mukesh Choudhary",
    "Rahul_Chahar": "Shashank Singh",
    "Rahul_Tewatia": "Arshdeep Singh",
    "Rahul_Tripathi": "Darshan Nalkande",
    "Ravichandran_Ashwin": "Manish Pandey",
    "Ravindra_Jadeja": "Jasprit Bumrah",
    "Ricky_Bhui": "Quinton de Kock",
    "Ricky_Ponting": "Tim Seifert",
    "Rinku_Singh": "Josh Inglis",
    "Sai_Kishore": "Wiaan Mulder",
    "Sai_Sudharsan": "Raj Angad Bawa",
    "Sandeep_Sharma": "Shardul Thakur",
    "Sanju_Samson": "Mustafizur Rahman",
    "Sarfaraz_Khan": "Sachin Baby",
    "Shahbaz_Nadeem": "Rahul Tewatia",
    "Sherfane_Rutherford": "Marco Jansen",
    "Sunil_Narine": "Himmat Singh",
    "Suyash_Sharma": "Shaik Rasheed",
    "T_Natarajan": "Vaibhav Arora",
    "Tim_Southee": "Mayank Yadav",
    "Travis_Head": "Mayank Markande",
    "Trent_Boult": "Marcus Stoinis",
    "Tushar_Deshpande": "Himmat Singh",
    "Umesh_Yadav": "Manish Pandey",
    "Unadkat": "Avesh Khan",
    "Vaibhav_Suryavanshi": "Manvanth Kumar",
    "Varun_Chakravarthy": "Maheesh Theekshana",
    "Vijay_Shankar": "David Miller",
    "Xavier_Bartlett": "Jamie Overton",
    "Yuvraj_Singh": "Mitchell Marsh",
    "Yuzvendra_Chahal": "Krunal Pandya"
};

// Convert name to filename format
function toFilename(name) {
    return name.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '_') + '.png';
}

// Step 1: Rename all files to temp names
console.log('Step 1: Renaming to temporary names...\n');
const tempMappings = [];

for (const [oldName, newName] of Object.entries(corrections)) {
    const oldFile = path.join(PHOTO_DIR, oldName + '.png');
    const tempFile = path.join(PHOTO_DIR, `__TEMP__${oldName}.png`);
    const finalFile = path.join(PHOTO_DIR, toFilename(newName));

    if (fs.existsSync(oldFile)) {
        try {
            fs.renameSync(oldFile, tempFile);
            console.log(`  ✓ ${oldName}.png -> __TEMP__${oldName}.png`);
            tempMappings.push({ tempFile, finalFile, newName });
        } catch (e) {
            console.log(`  ✗ Failed: ${oldName}.png - ${e.message}`);
        }
    } else {
        console.log(`  ⚠ Not found: ${oldName}.png`);
    }
}

// Step 2: Rename temp files to final names
console.log('\nStep 2: Renaming to final names...\n');
let renamed = 0;
let skipped = 0;

for (const { tempFile, finalFile, newName } of tempMappings) {
    if (fs.existsSync(tempFile)) {
        try {
            // If final file already exists, add a suffix
            let targetFile = finalFile;
            if (fs.existsSync(finalFile)) {
                const base = finalFile.replace('.png', '');
                let counter = 2;
                while (fs.existsSync(`${base}_${counter}.png`)) {
                    counter++;
                }
                targetFile = `${base}_${counter}.png`;
                console.log(`  ⚠ ${path.basename(finalFile)} exists, saving as ${path.basename(targetFile)}`);
            }

            fs.renameSync(tempFile, targetFile);
            console.log(`  ✓ -> ${path.basename(targetFile)}`);
            renamed++;
        } catch (e) {
            console.log(`  ✗ Failed: ${newName} - ${e.message}`);
        }
    }
}

console.log('\n' + '='.repeat(50));
console.log(`Renamed: ${renamed} files`);
console.log(`Skipped/Not found: ${Object.keys(corrections).length - renamed}`);

// Step 3: Generate new mapping.json
console.log('\nStep 3: Generating new mapping.json...');

const mapping = {};
const files = fs.readdirSync(PHOTO_DIR).filter(f => f.endsWith('.png'));

for (const file of files) {
    const name = file.replace('.png', '').replace(/_/g, ' ');
    mapping[name] = `/player-photos/${file}`;
}

fs.writeFileSync(
    path.join(PHOTO_DIR, 'mapping.json'),
    JSON.stringify(mapping, null, 2)
);

console.log(`Generated mapping.json with ${Object.keys(mapping).length} players`);

// Step 4: Generate new playerPhotos.js
console.log('\nStep 4: Generating playerPhotos.js...');

const entries = Object.entries(mapping)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([name, path]) => `    "${name}": "${path}"`)
    .join(',\n');

const code = `/**
 * Player Photo URLs - Local Photos with Name-Based Mapping
 * 
 * Photos are stored locally in /player-photos/ directory
 * Mapping is done by player name (case-insensitive)
 * 
 * AUTO-GENERATED - Total: ${Object.keys(mapping).length} players
 */

// Default player silhouette
const DEFAULT_PLAYER_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(\`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none">
  <circle cx="50" cy="50" r="50" fill="#1e293b"/>
  <circle cx="50" cy="35" r="18" fill="#475569"/>
  <ellipse cx="50" cy="80" rx="28" ry="22" fill="#475569"/>
</svg>
\`);

// Local player photo mapping - Player Name -> Local Photo Path
const LOCAL_PLAYER_PHOTOS = {
${entries}
};

// Build case-insensitive lookup map
const PLAYER_LOOKUP = {};
for (const name of Object.keys(LOCAL_PLAYER_PHOTOS)) {
    PLAYER_LOOKUP[name.toLowerCase()] = name;
}

/**
 * Get player photo URL by name (case-insensitive)
 * Returns local path if photo exists, null otherwise
 */
function getPlayerPhotoUrl(name) {
    if (!name) return null;

    const normalized = name.trim();
    const nameLower = normalized.toLowerCase();

    // Direct match
    if (LOCAL_PLAYER_PHOTOS[normalized]) {
        return LOCAL_PLAYER_PHOTOS[normalized];
    }

    // Case-insensitive match
    if (PLAYER_LOOKUP[nameLower]) {
        return LOCAL_PLAYER_PHOTOS[PLAYER_LOOKUP[nameLower]];
    }

    // No match found
    return null;
}

function getDefaultPlayerImage() {
    return DEFAULT_PLAYER_IMAGE;
}

// Legacy exports for compatibility
const PLAYER_IDS = {};
const LOCAL_PLAYERS = new Set(Object.keys(LOCAL_PLAYER_PHOTOS));

export {
    getPlayerPhotoUrl,
    getDefaultPlayerImage,
    DEFAULT_PLAYER_IMAGE,
    PLAYER_IDS,
    LOCAL_PLAYER_PHOTOS,
    LOCAL_PLAYERS
};
`;

fs.writeFileSync(
    path.join(__dirname, '../frontend/src/data/playerPhotos.js'),
    code
);

console.log(`Generated playerPhotos.js with ${Object.keys(mapping).length} player mappings`);
console.log('\n✅ Done!');
