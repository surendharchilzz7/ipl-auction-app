const fs = require('fs');
const path = require('path');

const targetDir = 'e:\\ipl-auction-app\\frontend\\public\\player-photos';
// 1x1 transparent PNG
const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

const players = [
    // Previous Broken/Pending (Still small files)
    "Michael_Hussey", "Mahela_Jayawardene", "Makhaya_Ntini",
    "Sanath_Jayasuriya", "Sohail_Tanvir", "Dale_Steyn",

    // IPL Cult Heroes & Stars (Missing or Placeholders)
    "Yusuf_Pathan",
    "Pragyan_Ojha",
    "Swapnil_Asnodkar",
    "Mitchell_Johnson",
    "Brad_Hodge",
    "Brad_Hogg",
    "Shaun_Tait",
    "Dirk_Nannes",
    "Murali_Vijay",
    "Subramaniam_Badrinath",
    "Mohammad_Kaif",
    "Parthiv_Patel",
    "Naman_Ojha",
    "Manvinder_Bisla",
    "Paul_Valthaty",
    "Ashish_Nehra",
    "Lakshmipathy_Balaji",
    "Munaf_Patel",
    "R_Vinay_Kumar",
    "Doug_Bollinger", // Re-verify
    "Albie_Morkel"    // Re-verify
];

if (!fs.existsSync(targetDir)) {
    console.error(`Target directory does not exist: ${targetDir}`);
    process.exit(1);
}

players.forEach(player => {
    const filePath = path.join(targetDir, `${player}.png`);
    // Create/Overwrite to ensure user has a fresh dummy to replace
    fs.writeFileSync(filePath, dummyPng);
    console.log(`Created ${filePath}`);
});

console.log('Dummy files created successfully for generic famous batch.');
