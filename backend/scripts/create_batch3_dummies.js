const fs = require('fs');
const path = require('path');

const targetDir = 'e:\\ipl-auction-app\\frontend\\public\\player-photos';
// 1x1 transparent PNG
const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

const players = [
    // High Impact Overseas Players (Similar to Lendl Simmons, Dwayne Smith)
    "Lendl_Simmons",
    "Dwayne_Smith",
    "Michael_Hussey",     // Still small/placeholder (checked in list)
    "Brendon_McCullum",   // Present but checking if user wants to replace (Size is 200KB+, likely fine)
    "Angelo_Mathews",
    "Tillakaratne_Dilshan", // Still pending? (Size 170KB+ looks okay now, removing from forced dummy unless broken)
    "Albie_Morkel",       // Still small (checked in list)
    "Makhaya_Ntini",      // Still small
    "Mahela_Jayawardene", // Still small
    "Sanath_Jayasuriya",  // File size 400KB+ (looks fixed by user! Great)
    "Sohail_Tanvir",      // File size 68 bytes (Still pending)
    "Dale_Steyn",         // File size 140KB (Fixed!)
    "Doug_Bollinger",     // File size 68 bytes (Still pending)

    // New Additions (Aggressive/Impact)
    "Aaron_Finch",        // 190KB (Fine)
    "David_Warner",       // 900KB (Fine)
    "Chris_Gayle",        // 55KB (Fine)
    "AB_de_Villiers",     // 52KB (Fine)
    "Eoin_Morgan",        // 955 bytes (Likely placeholder)
    "Ryan_ten_Doeschate", // 955 bytes (Likely placeholder)
    "Shakib_Al_Hasan",    // 14KB (Maybe low res?)
    "Ross_Taylor",        // 7KB (Likely low res/placeholder)
    "Brad_Hogg",          // 200KB+ (Fixed)
    "Brad_Hodge",         // 69KB (Fixed)

    // Specific requests similar to Simmons/Smith (Caribbean/Openers/All-rounders)
    "Kieron_Pollard",     // 180KB (Fine)
    "Sunil_Narine",       // 1MB+ (Fine)
    "Andre_Russell",      // 1MB+ (Fine)

    // More candidates for "likewise players"
    "Johan_Botha",
    "Thisara_Perera",
    "James_Faulkner",
    "Mitchell_Marsh",     // 1MB+ (Fine)
    "Glenn_Maxwell",      // 46KB (Fine)
    "Suresh_Raina",       // 180KB (Fixed)

    // Confirmed Dummies to Create (Missing or Small)
    "Jesse_Ryder",
    "Graeme_Smith",       // 10KB (Maybe low res?)
    "Herschelle_Gibbs",   // 500KB (Fixed)
    "Andrew_Symonds",     // 300KB (Fixed)
    "Scott_Styris",
    "Jacob_Oram",
    "Justin_Kemp",
    "Nuwan_Kulasekara",
    "Chaminda_Vaas",
    "Muttiah_Muralitharan" // 100KB (Fine?)
];

// Refined list to actually write
const targets = [
    "Lendl_Simmons",
    "Dwayne_Smith",
    "Eoin_Morgan",
    "Ryan_ten_Doeschate",
    "Angelo_Mathews",
    "Johan_Botha",
    "Thisara_Perera",
    "James_Faulkner",
    "Jesse_Ryder",
    "Scott_Styris",
    "Jacob_Oram",
    "Justin_Kemp",
    "Nuwan_Kulasekara",
    "Chaminda_Vaas",

    // Re-forcing pending ones that are confirmed small/dummy
    "Sohail_Tanvir",     // 68 bytes
    "Doug_Bollinger",    // 68 bytes
    "Albie_Morkel",      // 68 bytes
    "Makhaya_Ntini",     // 68 bytes
    "Ross_Taylor",       // 7KB potentially bad
    "Michael_Hussey"     // Still small? (Wait, list said 300KB+ now? Let me re-read list...)
];

// Correction from list reading:
// Michael_Hussey: 328812 (320KB) -> Fixed!
// Albie_Morkel: 68 bytes -> BROKEN
// Makhaya_Ntini: 68 bytes -> BROKEN
// Mahela_Jayawardene: 108648 (100KB) -> Fixed! (Wait, list said 108KB)
// Sohail_Tanvir: 68 bytes -> BROKEN
// Doug_Bollinger: 68 bytes -> BROKEN
// Ross_Taylor: 7506 (7KB) -> Probably bad

const final_targets = [
    "Lendl_Simmons",
    "Dwayne_Smith",
    "Eoin_Morgan",
    "Ryan_ten_Doeschate",
    "Angelo_Mathews",
    "Johan_Botha",
    "Thisara_Perera",
    "James_Faulkner",
    "Jesse_Ryder",
    "Scott_Styris",
    "Jacob_Oram",
    "Justin_Kemp",
    "Nuwan_Kulasekara",
    "Chaminda_Vaas",
    // Fixes
    "Sohail_Tanvir",
    "Doug_Bollinger",
    "Albie_Morkel",
    "Makhaya_Ntini",
    "Ross_Taylor"
];

if (!fs.existsSync(targetDir)) {
    console.error(`Target directory does not exist: ${targetDir}`);
    process.exit(1);
}

final_targets.forEach(player => {
    const filePath = path.join(targetDir, `${player}.png`);
    // Overwrite to ensure fresh dummy
    fs.writeFileSync(filePath, dummyPng);
    console.log(`Created ${filePath}`);
});

console.log('Dummy files created successfully for Batch 3.');
