const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
const cliProgress = require('cli-progress');

// --- CONFIGURATION ---
const YEARS = Array.from({ length: 2025 - 2008 + 1 }, (_, i) => 2025 - i); // 2025 down to 2008
const DATA_DIR = path.join(__dirname, '../data/seasons');
const PHOTOS_DIR = path.join(__dirname, '../../frontend/public/player-photos');
const EXISTING_PHOTOS_FILE = path.join(__dirname, '../../frontend/src/data/playerPhotos.js');
const FALLBACK_DATA = require('./historical_data_fallback');

// Standard IPL Teams (Slugs for iplt20.com)
const TEAMS = [
    'chennai-super-kings', 'delhi-capitals', 'gujarat-titans', 'kolkata-knight-riders',
    'lucknow-super-giants', 'mumbai-indians', 'punjab-kings', 'rajasthan-royals',
    'royal-challengers-bangalore', 'sunrisers-hyderabad', 'deccan-chargers',
    'pune-warriors', 'kochi-tuskers-kerala', 'gujarat-lions', 'rising-pune-supergiant'
];

// Map specific team names to standard slugs if needed, or handle legacy names
const TEAM_MAPPING = {
    "Chennai Super Kings": "CSK",
    "Delhi Capitals": "DC",
    "Delhi Daredevils": "DD",
    "Gujarat Titans": "GT",
    "Kolkata Knight Riders": "KKR",
    "Lucknow Super Giants": "LSG",
    "Mumbai Indians": "MI",
    "Punjab Kings": "PBKS", "Kings XI Punjab": "PBKS",
    "Rajasthan Royals": "RR",
    "Royal Challengers Bangalore": "RCB", "Royal Challengers Bengaluru": "RCB",
    "Sunrisers Hyderabad": "SRH",
    "Deccan Chargers": "DEC",
    "Pune Warriors": "PWI",
    "Kochi Tuskers Kerala": "KTK",
    "Gujarat Lions": "GL",
    "Rising Pune Supergiant": "RPS", "Rising Pune Supergiants": "RPS"
};

// Global Photo Map: Name -> LocalFilename (to ensure consistency across years)
const globalPhotoMap = new Map();

// --- HELPERS ---
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function sanitizeName(name) {
    return name.trim().replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_");
}

function getTeamCode(teamName) {
    return TEAM_MAPPING[teamName] || teamName.substring(0, 3).toUpperCase();
}

// Load existing photos from frontend to populate global map first (STRICT PRESERVATION)
function loadExistingPhotos() {
    if (fs.existsSync(EXISTING_PHOTOS_FILE)) {
        const content = fs.readFileSync(EXISTING_PHOTOS_FILE, 'utf8');
        // Simple regex to extract keys and values from the JS object
        const regex = /"([^"]+)":\s*"\/player-photos\/([^"]+)"/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            const [_, name, filename] = match;
            globalPhotoMap.set(name, filename.replace('/player-photos/', '')); // Store Original Name -> Filename
        }
        console.log(`[Init] Loaded ${globalPhotoMap.size} existing photo mappings.`);
    }
}

function savePhotoMapping() {
    console.log(`[Save] Updating ${EXISTING_PHOTOS_FILE}...`);
    const sortedKeys = Array.from(globalPhotoMap.keys()).sort();

    let fileContent = `/**\n * AUTO-GENERATED - ${sortedKeys.length} players\n */\n`;
    fileContent += `const DEFAULT_PLAYER_IMAGE = 'data:image/svg+xml,' + encodeURIComponent(\`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="#1e293b"/><circle cx="50" cy="35" r="18" fill="#475569"/><ellipse cx="50" cy="80" rx="28" ry="22" fill="#475569"/></svg>\`);\n`;
    fileContent += `const LOCAL_PLAYER_PHOTOS = {\n`;

    sortedKeys.forEach((name) => {
        let filename = globalPhotoMap.get(name);
        if (!filename.startsWith('/player-photos/')) filename = '/player-photos/' + filename;
        fileContent += `    "${name}": "${filename}",\n`;
    });

    fileContent += `};\n`;
    fileContent += `const PLAYER_LOOKUP = {};\n`;
    fileContent += `for (const n of Object.keys(LOCAL_PLAYER_PHOTOS)) PLAYER_LOOKUP[n.toLowerCase()] = n;\n`;
    fileContent += `function getPlayerPhotoUrl(name) {\n`;
    fileContent += `    if (!name) return null;\n`;
    fileContent += `    const n = name.trim(), k = n.toLowerCase();\n`;
    fileContent += `    return LOCAL_PLAYER_PHOTOS[n] || (PLAYER_LOOKUP[k] ? LOCAL_PLAYER_PHOTOS[PLAYER_LOOKUP[k]] : null);\n}\n`;
    fileContent += `function getDefaultPlayerImage() { return DEFAULT_PLAYER_IMAGE; }\n`;
    fileContent += `const PLAYER_IDS = {}, LOCAL_PLAYERS = new Set(Object.keys(LOCAL_PLAYER_PHOTOS));\n`;
    fileContent += `export { getPlayerPhotoUrl, getDefaultPlayerImage, DEFAULT_PLAYER_IMAGE, PLAYER_IDS, LOCAL_PLAYER_PHOTOS, LOCAL_PLAYERS };\n`;

    fs.writeFileSync(EXISTING_PHOTOS_FILE, fileContent);
    console.log(`[Save] Saved mapping for ${sortedKeys.length} players.`);
}

// --- SCRAPING FUNCTIONS ---

async function downloadPhoto(url, playerName) {
    if (!url) return null;

    // 1. Check if we already have a photo for this player in our map
    // Check case-insensitive
    let existingKey = null;
    for (const key of globalPhotoMap.keys()) {
        if (key.toLowerCase() === playerName.toLowerCase()) {
            existingKey = key;
            break;
        }
    }

    if (existingKey) {
        const existingFilename = globalPhotoMap.get(existingKey);
        // Verify it actually exists on disk
        if (fs.existsSync(path.join(PHOTOS_DIR, existingFilename.replace('/player-photos/', '')))) {
            return `/player-photos/${existingFilename.replace('/player-photos/', '')}`;
        }
    }

    // 2. Determine new filename
    const filename = `${sanitizeName(playerName)}.png`;
    const filePath = path.join(PHOTOS_DIR, filename);

    // 3. STRICT CHECK: If file exists on disk, DO NOT OVERWRITE. Use it.
    if (fs.existsSync(filePath)) {
        globalPhotoMap.set(playerName, filename);
        return `/player-photos/${filename}`;
    }

    // 4. Download new photo
    try {
        const response = await axios({ url, responseType: 'stream', timeout: 10000 });
        const writer = fs.createWriteStream(filePath);
        response.data.pipe(writer);

        await new Promise((resolve, reject) => {
            writer.on('finish', resolve);
            writer.on('error', reject);
        });

        globalPhotoMap.set(playerName, filename);
        return `/player-photos/${filename}`;
    } catch (e) {
        // console.error(`[Current] Failed to download photo for ${playerName}: ${e.message}`);
        return null; // Fail silently, use backup or default later
    }
}

// Scrape AUCTION Page (2013-2025) - Gets Sold + Unsold
async function scrapeAuctionData(year) {
    console.log(`[${year}] Scraping Auction Data...`);
    const players = [];
    // Note: URL might need adjustment based on research (2013+ works usually)
    const url = `https://www.iplt20.com/auction/${year}`;

    try {
        const { data } = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(data);

        // This selector strategy usually works for the combined tables on recent pages
        // or we need to look for specific tabs. 
        // For simplicity, we scrape ALL tables found on the page.

        $('.ih-auction-table table tbody tr').each((_, row) => {
            const cells = $(row).find('td');
            // Typical structure: Team(if sold) | Player | Role | Price
            // Structure varies slightly by year. 
            // 2024: Name is usually in cell 0 or 1.

            let name = $(cells).find('.ih-pt-name').text().trim() || $(cells).eq(0).text().trim();
            let role = $(cells).eq(2).text().trim(); // Rough guess, refined below
            let type = "BAT"; // Default
            let price = "2000000"; // Default 20L
            let team = null;

            // Refined extraction logic could go here based on column headers
            // For now, doing a generic extraction.
            const rowText = $(row).text();

            // Simple heuristics for Role
            if (rowText.includes("Batter")) type = "BAT";
            else if (rowText.includes("Bowler")) type = "BOWL";
            else if (rowText.includes("All-Rounder")) type = "AR";
            else if (rowText.includes("Wicket-Keeper")) type = "WK";

            // Price parsing (e.g., "2.00 Cr", "20.00 Lakh")
            // Needs robust parser. Setting placeholders for now.

            if (name) {
                players.push({
                    name,
                    set: type,
                    basePrice: 20, // Placeholder, would parse real price
                    isSold: !rowText.includes("Unsold"), // Rough check
                });
            }
        });
    } catch (e) {
        console.warn(`[${year}] Auction scrape failed: ${e.message}`);
    }
    return players;
}

// Scrape SQUAD Pages (2008-2025) - Used for Photos and Pre-2013 Data
async function scrapeSquads(year) {
    const players = [];
    const activeTeams = new Set();
    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    bar.start(TEAMS.length, 0);

    for (const teamSlug of TEAMS) {
        const url = `https://www.iplt20.com/teams/${teamSlug}/squad/${year}`;
        try {
            const { data } = await axios.get(url, { validateStatus: false });
            if (!data) continue;

            const $ = cheerio.load(data);
            let foundForTeam = false;

            $('.ih-pcard-wrap li, .ih-pcard-sec li').each((_, card) => {
                const name = $(card).find('h2').text().trim();
                if (!name) return;
                foundForTeam = true;

                // Photo: prioritize non-svg
                let photoUrl = $(card).find('img').first().attr('src');
                const imgs = $(card).find('img');
                imgs.each((_, img) => {
                    const src = $(img).attr('src');
                    if (src && !src.endsWith('.svg')) photoUrl = src;
                });

                // Determine Team Code
                let teamCode = "UNK";
                if (teamSlug.includes('chennai')) teamCode = "CSK";
                else if (teamSlug.includes('delhi-capitals')) teamCode = "DC";
                else if (teamSlug === 'delhi-daredevils') teamCode = "DD";
                else if (teamSlug.includes('gujarat-titans')) teamCode = "GT";
                else if (teamSlug.includes('kolkata')) teamCode = "KKR";
                else if (teamSlug.includes('lucknow')) teamCode = "LSG";
                else if (teamSlug.includes('mumbai')) teamCode = "MI";
                else if (teamSlug.includes('punjab')) teamCode = "PBKS";
                else if (teamSlug.includes('rajasthan')) teamCode = "RR";
                else if (teamSlug.includes('royal')) teamCode = "RCB";
                else if (teamSlug.includes('sunri')) teamCode = "SRH";
                else if (teamSlug.includes('deccan')) teamCode = "DEC";
                else if (teamSlug.includes('pune-war')) teamCode = "PWI";
                else if (teamSlug.includes('kochi')) teamCode = "KTK";
                else if (teamSlug.includes('gujarat-lions')) teamCode = "GL";
                else if (teamSlug.includes('rising')) teamCode = "RPS";

                players.push({
                    name,
                    team: teamCode, // Known team from URL
                    photoUrl
                });
            });

            if (foundForTeam) {
                let teamCode = "UNK";
                if (teamSlug.includes('chennai')) teamCode = "CSK";
                else if (teamSlug.includes('delhi-capitals')) teamCode = "DC";
                else if (teamSlug === 'delhi-daredevils') teamCode = "DD";
                else if (teamSlug.includes('gujarat-titans')) teamCode = "GT";
                else if (teamSlug.includes('kolkata')) teamCode = "KKR";
                else if (teamSlug.includes('lucknow')) teamCode = "LSG";
                else if (teamSlug.includes('mumbai')) teamCode = "MI";
                else if (teamSlug.includes('punjab')) teamCode = "PBKS";
                else if (teamSlug.includes('rajasthan')) teamCode = "RR";
                else if (teamSlug.includes('royal')) teamCode = "RCB";
                else if (teamSlug.includes('sunri')) teamCode = "SRH";
                else if (teamSlug.includes('deccan')) teamCode = "DEC";
                else if (teamSlug.includes('pune-war')) teamCode = "PWI";
                else if (teamSlug.includes('kochi')) teamCode = "KTK";
                else if (teamSlug.includes('gujarat-lions')) teamCode = "GL";
                else if (teamSlug.includes('rising')) teamCode = "RPS";

                if (teamCode !== "UNK") activeTeams.add(teamCode);
            }
        } catch (e) { }
        bar.increment();
    }
    bar.stop();
    return { players, activeTeams: Array.from(activeTeams) };
}

// --- MAIN EXECUTION ---

(async () => {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

    loadExistingPhotos(); // Populate map

    for (const year of YEARS) {
        console.log(`\n=== PROCESSING ${year} ===`);

        // 1. Get Core Data (Using Squads for everything for consistency & photos)
        let { players: squadPlayers, activeTeams } = await scrapeSquads(year);

        // MERGE FALLBACK DATA (for defunct teams not on iplt20.com)
        if (FALLBACK_DATA[year]) {
            console.log(`   [Fallback] Merging ${FALLBACK_DATA[year].length} players from fallback data...`);
            const fallbackPlayers = FALLBACK_DATA[year].map(p => ({
                name: p.name,
                team: p.team,
                photoUrl: null // No photo URL for manual entries, relies on global map or placeholder
            }));
            squadPlayers = [...squadPlayers, ...fallbackPlayers];

            // Add fallback teams to activeTeams
            const fallbackTeams = new Set(FALLBACK_DATA[year].map(p => p.team));
            fallbackTeams.forEach(t => {
                if (!activeTeams.includes(t)) activeTeams.push(t);
            });
        }

        console.log(`   Found ${squadPlayers.length} players across ${activeTeams.length} teams: ${activeTeams.join(', ')}`);

        // 2. Process Photos
        const startCount = globalPhotoMap.size;
        const finalizedPlayers = [];

        for (const p of squadPlayers) {
            // Download Photo
            const localPhotoPath = await downloadPhoto(p.photoUrl, p.name);

            finalizedPlayers.push({
                id: sanitizeName(p.name) + "_" + year,
                name: p.name,
                set: p.role || "BAT",
                basePrice: p.price || 2,
                originalTeam: p.team
            });
        }

        console.log(`   Photos added: ${globalPhotoMap.size - startCount}`);

        // 3. Save JSON
        const output = {
            season: year,
            teams: activeTeams, // SAVE ACTIVE TEAMS
            players: finalizedPlayers
        };

        fs.writeFileSync(path.join(DATA_DIR, `${year}.json`), JSON.stringify(output, null, 2));
    }

    console.log("\nDone! All seasons processed.");
    savePhotoMapping();
})();
