const fs = require('fs');
const path = require('path');

const targetDir = 'e:\\ipl-auction-app\\frontend\\public\\player-photos';

// 1x1 transparent PNG
const dummyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64');

const players = [
    // Legends
    "Rahul_Dravid", "VVS_Laxman", "Brett_Lee", "Shoaib_Akhtar", "Shaun_Pollock",
    "Graeme_Smith", "Andrew_Symonds", "Herschelle_Gibbs", "Albie_Morkel",
    "Kumar_Sangakkara", "Mahela_Jayawardene", "Makhaya_Ntini", "Ross_Taylor",

    // Re-download (Bad Quality)
    "Michael_Hussey", "Tillakaratne_Dilshan", "Daniel_Vettori", "Kevin_Pietersen",
    "Dale_Steyn", "Doug_Bollinger", "Morne_Morkel", "Shakib_Al_Hasan",

    // Missing Batch 1
    "Sourav_Ganguly", "Sohail_Tanvir", "Dwayne_Bravo", "Sanath_Jayasuriya",
    "RP_Singh", "Zaheer_Khan", "Adam_Gilchrist", "Matthew_Hayden",
    "Suresh_Raina", "Gautam_Gambhir"
];

if (!fs.existsSync(targetDir)) {
    console.error(`Target directory does not exist: ${targetDir}`);
    process.exit(1);
}

players.forEach(player => {
    const filePath = path.join(targetDir, `${player}.png`);
    // Only create if it doesn't exist or if we want to force overwrite (user said create dummy file)
    // User said "create a dummy .png file so that once i download i will just replace"
    // So I should write it. 
    // But be careful not to overwrite if they already downloaded one in the last few seconds?
    // User is asking FOR this now, so I assume they haven't done it yet.
    fs.writeFileSync(filePath, dummyPng);
    console.log(`Created ${filePath}`);
});

console.log('Dummy files created successfully.');
