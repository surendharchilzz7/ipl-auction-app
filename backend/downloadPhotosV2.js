/**
 * IPL Player Photo Downloader - Using Browser Scraping for Headshot IDs
 * 
 * This script uses the browser to scrape each team's squad page to get
 * the actual headshot image URLs directly (since headshot IDs differ from profile IDs)
 * 
 * Run with: node downloadPhotosV2.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Output directory
const OUTPUT_DIR = path.join(__dirname, '../frontend/public/player-photos');

// All 10 IPL team squad URLs
const TEAM_URLS = [
    { name: 'CSK', url: 'https://www.iplt20.com/teams/chennai-super-kings/squad' },
    { name: 'MI', url: 'https://www.iplt20.com/teams/mumbai-indians/squad' },
    { name: 'RCB', url: 'https://www.iplt20.com/teams/royal-challengers-bengaluru/squad' },
    { name: 'KKR', url: 'https://www.iplt20.com/teams/kolkata-knight-riders/squad' },
    { name: 'SRH', url: 'https://www.iplt20.com/teams/sunrisers-hyderabad/squad' },
    { name: 'RR', url: 'https://www.iplt20.com/teams/rajasthan-royals/squad' },
    { name: 'DC', url: 'https://www.iplt20.com/teams/delhi-capitals/squad' },
    { name: 'PBKS', url: 'https://www.iplt20.com/teams/punjab-kings/squad' },
    { name: 'LSG', url: 'https://www.iplt20.com/teams/lucknow-super-giants/squad' },
    { name: 'GT', url: 'https://www.iplt20.com/teams/gujarat-titans/squad' }
];

// Track all players found
const allPlayers = new Map(); // name -> { headshotId, headshotUrl }

// Create filename from player name
function createFilename(name) {
    return name.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '_') + '.png';
}

// Check if photo already exists
function photoExists(name) {
    const filename = createFilename(name);
    return fs.existsSync(path.join(OUTPUT_DIR, filename));
}

// Fetch URL content
function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        };

        const req = https.get(url, options, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                fetchUrl(res.headers.location).then(resolve).catch(reject);
                return;
            }

            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });

        req.on('error', reject);
        req.setTimeout(30000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
    });
}

// Download image to file
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'image/webp,image/png,image/*,*/*;q=0.8'
            }
        };

        const file = fs.createWriteStream(filepath);

        const req = https.get(url, options, (res) => {
            if (res.statusCode === 200 && res.headers['content-type']?.includes('image')) {
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    // Check if file is valid (> 1KB)
                    const stats = fs.statSync(filepath);
                    if (stats.size > 1000) {
                        resolve(true);
                    } else {
                        fs.unlinkSync(filepath);
                        resolve(false);
                    }
                });
            } else if (res.statusCode === 301 || res.statusCode === 302) {
                file.close();
                if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
                downloadImage(res.headers.location, filepath).then(resolve).catch(reject);
            } else {
                file.close();
                if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
                resolve(false);
            }
        });

        req.on('error', () => {
            file.close();
            if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
            resolve(false);
        });

        req.setTimeout(30000, () => {
            req.destroy();
            file.close();
            if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
            resolve(false);
        });
    });
}

// Extract players from team page HTML
// Looks for IPLHeadshot URLs and nearest player names
function extractPlayersFromHtml(html) {
    const players = [];

    // Pattern to match headshot image URLs: /IPLHeadshot2025/XXX.png
    const headshotPattern = /IPLHeadshot2025\/(\d+)\.png/gi;

    // Find all headshot IDs first
    const headshotIds = new Set();
    let match;
    while ((match = headshotPattern.exec(html)) !== null) {
        headshotIds.add(match[1]);
    }

    // Now find player names - they appear near each headshot
    // Pattern: name is in the card link text
    // Example: /players/ms-dhoni/1 -> "Ms Dhoni"
    const playerPattern = /\/players\/([a-z0-9-]+)\/(\d+)/gi;
    const nameMap = new Map();

    while ((match = playerPattern.exec(html)) !== null) {
        const slug = match[1];
        const profileId = match[2];

        // Convert slug to proper name
        const name = slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        if (!nameMap.has(profileId)) {
            nameMap.set(profileId, name);
        }
    }

    // Find correlation between names and headshot IDs in the HTML
    // We need to search for patterns where the name and headshot are close together
    for (const [profileId, name] of nameMap) {
        // Look for the headshot ID that appears near this player's profile link
        // This is a heuristic - we search for the headshot ID within 500 chars of the profile ID
        const profilePattern = new RegExp(`/players/[^/]+/${profileId}`, 'g');
        let profileMatch;

        while ((profileMatch = profilePattern.exec(html)) !== null) {
            const searchStart = Math.max(0, profileMatch.index - 500);
            const searchEnd = Math.min(html.length, profileMatch.index + 500);
            const nearby = html.substring(searchStart, searchEnd);

            const headshotMatch = nearby.match(/IPLHeadshot2025\/(\d+)\.png/);
            if (headshotMatch) {
                const headshotId = headshotMatch[1];
                if (!players.find(p => p.name === name)) {
                    players.push({
                        name,
                        headshotId,
                        headshotUrl: `https://documents.iplt20.com/ipl/IPLHeadshot2025/${headshotId}.png`
                    });
                }
                break;
            }
        }
    }

    return players;
}

// Download a player photo
async function downloadPlayer(player) {
    const filename = createFilename(player.name);
    const filepath = path.join(OUTPUT_DIR, filename);

    try {
        const success = await downloadImage(player.headshotUrl, filepath);
        return success;
    } catch (e) {
        return false;
    }
}

// Generate mapping JSON
function generateMapping() {
    const mapping = {};
    const files = fs.readdirSync(OUTPUT_DIR).filter(f => f.endsWith('.png'));

    for (const file of files) {
        // Convert filename back to name
        const name = file.replace('.png', '').replace(/_/g, ' ');
        mapping[name] = `/player-photos/${file}`;
    }

    // Save mapping
    fs.writeFileSync(
        path.join(OUTPUT_DIR, 'mapping.json'),
        JSON.stringify(mapping, null, 2)
    );

    console.log(`\n📁 Generated mapping.json with ${Object.keys(mapping).length} players`);
    return mapping;
}

// Generate playerPhotos.js content
function generatePlayerPhotosJS(mapping) {
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

    console.log(`📄 Generated playerPhotos.js with ${Object.keys(mapping).length} player mappings`);
}

// Main function  
async function main() {
    console.log('='.repeat(60));
    console.log('  IPL Player Photo Downloader v2 (Direct Headshot ID Scraping)');
    console.log('='.repeat(60));

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Step 1: Fetch and parse all team pages
    console.log('\n📡 Fetching team squad pages...\n');

    for (const team of TEAM_URLS) {
        process.stdout.write(`  Fetching ${team.name}... `);

        try {
            const html = await fetchUrl(team.url);
            const players = extractPlayersFromHtml(html);

            for (const player of players) {
                if (!allPlayers.has(player.name.toLowerCase())) {
                    allPlayers.set(player.name.toLowerCase(), player);
                }
            }

            console.log(`✓ Found ${players.length} players with headshot IDs`);
        } catch (error) {
            console.log(`✗ Error: ${error.message}`);
        }

        // Small delay between requests
        await new Promise(r => setTimeout(r, 500));
    }

    console.log(`\n📊 Total unique players with headshots: ${allPlayers.size}\n`);

    if (allPlayers.size === 0) {
        console.log('❌ No players found with headshot URLs.');
        console.log('   This script requires JS rendering. Use the browser scraper instead.');
        return;
    }

    // Step 2: Filter out existing photos
    const existing = [];
    const toDownload = [];

    for (const [key, player] of allPlayers) {
        if (photoExists(player.name)) {
            existing.push(player.name);
        } else {
            toDownload.push(player);
        }
    }

    console.log(`📸 Existing photos: ${existing.length}`);
    console.log(`⬇️  To download: ${toDownload.length}`);
    console.log('\n🚀 Starting downloads...\n');

    // Step 3: Download missing photos
    let downloaded = 0;
    let failed = 0;
    const failedPlayers = [];

    for (let i = 0; i < toDownload.length; i++) {
        const player = toDownload[i];
        const progress = `[${i + 1}/${toDownload.length}]`;

        process.stdout.write(`${progress} ${player.name}... `);

        const success = await downloadPlayer(player);

        if (success) {
            console.log('✓');
            downloaded++;
        } else {
            console.log('✗');
            failed++;
            failedPlayers.push(player.name);
        }

        // Rate limiting
        await new Promise(r => setTimeout(r, 100));
    }

    // Step 4: Summary
    console.log('\n' + '='.repeat(60));
    console.log('                     SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Already existed: ${existing.length}`);
    console.log(`✅ Downloaded: ${downloaded}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total photos: ${existing.length + downloaded}`);

    if (failedPlayers.length > 0 && failedPlayers.length <= 20) {
        console.log('\n⚠️  Failed players:');
        failedPlayers.forEach(name => console.log(`   - ${name}`));
    }

    // Step 5: Generate mappings
    console.log('\n📝 Generating mapping files...');
    const mapping = generateMapping();
    generatePlayerPhotosJS(mapping);

    console.log('\n✅ Done!');
    console.log('='.repeat(60));
}

main().catch(console.error);
