const https = require('https');
const fs = require('fs');
const path = require('path');

const TEAMS = [
    { name: 'Chennai Super Kings', slug: 'chennai-super-kings' },
    { name: 'Mumbai Indians', slug: 'mumbai-indians' },
    { name: 'Royal Challengers Bengaluru', slug: 'royal-challengers-bengaluru' }, // Check slug validity, might be bangalore for old
    { name: 'Kolkata Knight Riders', slug: 'kolkata-knight-riders' },
    { name: 'Rajasthan Royals', slug: 'rajasthan-royals' },
    { name: 'Punjab Kings', slug: 'punjab-kings' },
    { name: 'Delhi Capitals', slug: 'delhi-capitals' },
    { name: 'Sunrisers Hyderabad', slug: 'sunrisers-hyderabad' },
    { name: 'Gujarat Titans', slug: 'gujarat-titans' },
    { name: 'Lucknow Super Giants', slug: 'lucknow-super-giants' }
];

// Map for old slugs if needed (some URLs might still use old names or redirects handles it)
// IPLT20 usually redirects `delhi-daredevils` to `delhi-capitals` but let's use current slugs for archive as observed.
// Exception: RCB slug might be `royal-challengers-bangalore` vs `royal-challengers-bengaluru`. 
// I'll check both if one fails, or assume the site handles it. Verified active team is `royal-challengers-bengaluru` in 2024 but `royal-challengers-bangalore` for history?
// I'll use `royal-challengers-bangalore` as primary for history if needed, but let's try strict list first.
// Actually, `royal-challengers-bengaluru` is very new. Most history is under `royal-challengers-bangalore`.

const OLD_SLUGS = {
    'royal-challengers-bengaluru': 'royal-challengers-bangalore'
};

const YEARS = Array.from({ length: 17 }, (_, i) => 2008 + i); // 2008-2024
const OUTPUT_FILE = path.join(__dirname, '../data/iplt20_master_data.json');

async function fetchUrl(url) {
    return new Promise((resolve, reject) => {
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            timeout: 10000
        };
        const req = https.get(url, options, (res) => {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                // Follow redirect
                fetchUrl(res.headers.location).then(resolve).catch(reject);
                return;
            }
            if (res.statusCode !== 200) {
                resolve(null); // URL failed (e.g. team didn't exist that year)
                return;
            }
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        });
        req.on('error', (e) => resolve(null));
        req.on('timeout', () => { req.destroy(); resolve(null); });
    });
}

function parseSquad(html) {
    const players = [];
    if (!html) return players;

    // Split by INDIVIDUAL player card <li>
    // Identifier: <li class="dys-box-color ih-pcard1"
    const cards = html.split('<li class="dys-box-color ih-pcard1"');

    // Skip first chunk (header/previous content)
    for (let i = 1; i < cards.length; i++) {
        const card = cards[i];

        // Extract Name
        // Pattern: <div class="ih-p-name">\s*<h2>Name</h2>
        // Using [\s\S]*? to match across newlines if needed
        const nameMatch = card.match(/<div class="ih-p-name">\s*<h2>([\s\S]*?)<\/h2>/);
        if (!nameMatch) continue;
        const name = nameMatch[1].trim();

        // Extract Role
        // Pattern: <span class="d-block w-100 text-center">Role</span>
        const roleMatch = card.match(/<span class="d-block w-100 text-center">([\s\S]*?)<\/span>/);
        let roleRaw = roleMatch ? roleMatch[1].trim() : "Unknown";

        // Remove HTML comments or extra tags if any
        roleRaw = roleRaw.replace(/<!--[\s\S]*?-->/g, '').trim();

        // Normalize Role
        let role = "BAT";
        const rLower = roleRaw.toLowerCase();
        if (rLower.includes('wicket') || rLower.includes('wk')) role = "WK";
        else if (rLower.includes('all-rounder') || rLower.includes('all rounder') || rLower.includes('ar')) role = "AR";
        else if (rLower.includes('bowler')) role = "BOWL";

        // Extract Overseas Status
        // Logic: Check for a second image in the .teams-icon block
        const iconBlockMatch = card.match(/<div class="teams-icon">([\s\S]*?)<\/div>/);
        let overseas = false;
        if (iconBlockMatch) {
            const iconBlock = iconBlockMatch[1];
            // Count <img> tags
            const imgCount = (iconBlock.match(/<img/g) || []).length;
            if (imgCount >= 2) overseas = true;
        }

        players.push({ name, role, overseas, roleRaw });
    }
    return players;
}

async function main() {
    const masterData = {};

    for (const year of YEARS) {
        console.log(`Processing ${year}...`);
        masterData[year] = {};

        for (const team of TEAMS) {
            let slug = team.slug;
            // Handle historical slug mapping (simplistic)
            if (team.slug === 'royal-challengers-bengaluru' && year < 2024) slug = 'royal-challengers-bangalore';
            if (team.slug === 'delhi-capitals' && year < 2019) slug = 'delhi-daredevils';
            if (team.slug === 'punjab-kings' && year < 2021) slug = 'kings-xi-punjab';

            // Defunct teams are separate, but let's try standard active ones first.

            const url = `https://www.iplt20.com/teams/${slug}/squad/${year}`;
            // console.log(`  Fetching ${team.name} (${url})...`);

            const html = await fetchUrl(url);
            if (!html) {
                // console.log(`    Failed/No squad for ${team.name} in ${year}`);
                continue;
            }

            const players = parseSquad(html);
            if (players.length > 0) {
                console.log(`    ${team.name}: ${players.length} players found.`);

                players.forEach(p => {
                    // Normalize name key
                    const key = p.name;
                    // Store
                    masterData[year][key] = {
                        role: p.role,
                        overseas: p.overseas,
                        team: team.name
                    };
                });
            }
        }
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(masterData, null, 2));
    console.log(`Saved master data to ${OUTPUT_FILE}`);
}

main();
