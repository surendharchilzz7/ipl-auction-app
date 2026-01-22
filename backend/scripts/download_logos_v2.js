const fs = require('fs');
const path = require('path');
const https = require('https');

const LOGO_DIR = path.join(__dirname, '../../frontend/public/team-logos');
if (!fs.existsSync(LOGO_DIR)) fs.mkdirSync(LOGO_DIR, { recursive: true });

// Wikipedia/Wikimedia definitions for high quality transparent logos
const LOGOS = {
    // Active (2025)
    "CSK": "https://upload.wikimedia.org/wikipedia/en/thumb/2/2b/Chennai_Super_Kings_Logo.svg/1200px-Chennai_Super_Kings_Logo.svg.png",
    "MI": "https://upload.wikimedia.org/wikipedia/en/thumb/c/cd/Mumbai_Indians_Logo.svg/1200px-Mumbai_Indians_Logo.svg.png",
    "RCB": "https://upload.wikimedia.org/wikipedia/en/thumb/2/2a/Royal_Challengers_Bangalore_2020.svg/1200px-Royal_Challengers_Bangalore_2020.svg.png",
    "KKR": "https://upload.wikimedia.org/wikipedia/en/thumb/4/4c/Kolkata_Knight_Riders_Logo.svg/1200px-Kolkata_Knight_Riders_Logo.svg.png",
    "SRH": "https://upload.wikimedia.org/wikipedia/en/thumb/8/81/Sunrisers_Hyderabad.svg/1200px-Sunrisers_Hyderabad.svg.png",
    "RR": "https://upload.wikimedia.org/wikipedia/en/thumb/6/60/Rajasthan_Royals_Logo.svg/1200px-Rajasthan_Royals_Logo.svg.png",
    "DC": "https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Delhi_Capitals_Logo.svg/1200px-Delhi_Capitals_Logo.svg.png",
    "PBKS": "https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Punjab_Kings_Logo.svg/1200px-Punjab_Kings_Logo.svg.png",
    "LSG": "https://upload.wikimedia.org/wikipedia/en/thumb/a/a9/Lucknow_Super_Giants_IPL_Logo.svg/1200px-Lucknow_Super_Giants_IPL_Logo.svg.png",
    "GT": "https://upload.wikimedia.org/wikipedia/en/thumb/2/23/Gujarat_Titans_Logo.svg/1200px-Gujarat_Titans_Logo.svg.png",

    // Defunct
    "DEC": "https://upload.wikimedia.org/wikipedia/en/thumb/9/9b/Deccan_Chargers_Logo.svg/1200px-Deccan_Chargers_Logo.svg.png",
    "DD": "https://upload.wikimedia.org/wikipedia/en/thumb/f/f5/Delhi_Daredevils_Logo.svg/1200px-Delhi_Daredevils_Logo.svg.png", // Often same as DC but historical
    "PWI": "https://upload.wikimedia.org/wikipedia/en/thumb/f/f6/Pune_Warriors_India_Logo.svg/1200px-Pune_Warriors_India_Logo.svg.png",
    "KTK": "https://upload.wikimedia.org/wikipedia/en/thumb/e/e0/Kochi_Tuskers_Kerala_Logo.svg/1200px-Kochi_Tuskers_Kerala_Logo.svg.png",
    "GL": "https://upload.wikimedia.org/wikipedia/en/thumb/9/9b/Gujarat_Lions_Logo.svg/1200px-Gujarat_Lions_Logo.svg.png",
    "RPS": "https://upload.wikimedia.org/wikipedia/en/thumb/c/c9/Rising_Pune_Supergiants_2016_Logo.svg/1200px-Rising_Pune_Supergiants_2016_Logo.svg.png"
};

const download = (url, name) => {
    return new Promise((resolve, reject) => {
        const dest = path.join(LOGO_DIR, `${name}.png`);
        const file = fs.createWriteStream(dest);
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, function (response) {
            response.pipe(file);
            file.on('finish', function () {
                file.close(() => {
                    console.log(`Downloaded ${name}`);
                    resolve();
                });
            });
        }).on('error', function (err) {
            fs.unlink(dest, () => { });
            console.error(`Error downloading ${name}: ${err.message}`);
            resolve(); // Don't crash
        });
    });
};

async function main() {
    console.log("Downloading logos...");
    for (const [code, url] of Object.entries(LOGOS)) {
        await download(url, code);
    }
    console.log("All logos downloaded.");
}

main();
