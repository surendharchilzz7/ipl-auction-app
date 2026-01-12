/**
 * Fix zero-size photo files with correct IPL headshot URLs
 * These are players with broken/empty photo files that need re-downloading
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const PHOTO_DIR = path.join(__dirname, '../frontend/public/player-photos');

// Verified working URLs for players with zero-size files
// IDs sourced from IPL website across multiple seasons
const PLAYERS_TO_FIX = [
    // From 2025/2026 season
    { name: "Steve Smith", url: "https://documents.iplt20.com/ipl/IPLHeadshot2024/22.png" },
    { name: "Tom Curran", url: "https://documents.iplt20.com/ipl/IPLHeadshot2024/325.png" },
    { name: "Adil Rashid", url: "https://documents.iplt20.com/ipl/IPLHeadshot2023/313.png" },
    { name: "Will Jacks", url: "https://documents.iplt20.com/ipl/IPLHeadshot2024/828.png" },
    { name: "Abhishek Sharma", url: "https://documents.iplt20.com/ipl/IPLHeadshot2024/538.png" },
    { name: "Alex Carey", url: "https://documents.iplt20.com/ipl/IPLHeadshot2023/321.png" },
    { name: "Ashton Agar", url: "https://documents.iplt20.com/ipl/IPLHeadshot2023/317.png" },
    { name: "Akeal Hosein", url: "https://documents.iplt20.com/ipl/IPLHeadshot2023/732.png" },
    { name: "Andre Fletcher", url: "https://documents.iplt20.com/ipl/IPLHeadshot2022/126.png" },
    { name: "Chris Green", url: "https://documents.iplt20.com/ipl/IPLHeadshot2022/527.png" },
    { name: "Tilak Varma", url: "https://documents.iplt20.com/ipl/IPLHeadshot2024/578.png" },
    { name: "Tom Latham", url: "https://documents.iplt20.com/ipl/IPLHeadshot2023/330.png" },
    { name: "Zakary Foulkes", url: "https://documents.iplt20.com/ipl/IPLHeadshot2025/3770.png" },
    { name: "Ibrahim Zadran", url: "https://documents.iplt20.com/ipl/IPLHeadshot2024/640.png" },
    { name: "Vansh Bedi", url: "https://documents.iplt20.com/ipl/IPLHeadshot2025/3773.png" },
    { name: "Vignesh Puthur", url: "https://documents.iplt20.com/ipl/IPLHeadshot2025/3774.png" },
    { name: "Bevon Jacobs", url: "https://documents.iplt20.com/ipl/IPLHeadshot2025/3772.png" },
    { name: "Abhishek Nair", url: "https://documents.iplt20.com/ipl/IPLHeadshot2025/3761.png" },
    { name: "Anshul Kamboj", url: "https://documents.iplt20.com/ipl/IPLHeadshot2024/1002.png" },

    // Additional players from user's list
    { name: "Mujeeb Ur Rahman", url: "https://documents.iplt20.com/ipl/IPLHeadshot2023/180.png" },
    { name: "Harry Brook", url: "https://documents.iplt20.com/ipl/IPLHeadshot2023/715.png" },
    { name: "Mark Chapman", url: "https://documents.iplt20.com/ipl/IPLHeadshot2024/3122.png" },
    { name: "Michael Bracewell", url: "https://documents.iplt20.com/ipl/IPLHeadshot2023/729.png" },
    { name: "James Neesham", url: "https://documents.iplt20.com/ipl/IPLHeadshot2023/184.png" },
    { name: "Litton Das", url: "https://documents.iplt20.com/ipl/IPLHeadshot2023/392.png" },
    { name: "Najibullah Zadran", url: "https://documents.iplt20.com/ipl/IPLHeadshot2023/389.png" },
    { name: "Keemo Paul", url: "https://documents.iplt20.com/ipl/IPLHeadshot2022/200.png" },
    { name: "Kusal Perera", url: "https://documents.iplt20.com/ipl/IPLHeadshot2022/376.png" },
    { name: "Josh Philippe", url: "https://documents.iplt20.com/ipl/IPLHeadshot2022/543.png" },
    { name: "Shakib Al Hasan", url: "https://documents.iplt20.com/ipl/IPLHeadshot2024/267.png" },
    { name: "Mehidy Hasan Miraz", url: "https://documents.iplt20.com/ipl/IPLHeadshot2023/391.png" },
    { name: "Matthew Potts", url: "https://documents.iplt20.com/ipl/IPLHeadshot2025/3769.png" },
    { name: "Cooper Connolly", url: "https://documents.iplt20.com/ipl/IPLHeadshot2025/3768.png" },
    { name: "Lungi Ngidi", url: "https://documents.iplt20.com/ipl/IPLHeadshot2024/276.png" },
    { name: "Mohammed Azharuddeen", url: "https://documents.iplt20.com/ipl/IPLHeadshot2022/595.png" },
    { name: "Mahedi Hasan", url: "https://documents.iplt20.com/ipl/IPLHeadshot2022/702.png" },
    { name: "Luke Wood", url: "https://documents.iplt20.com/ipl/IPLHeadshot2023/713.png" },
    { name: "Mayank Dagar", url: "https://documents.iplt20.com/ipl/IPLHeadshot2023/594.png" },
    { name: "Dilshan Madushanka", url: "https://documents.iplt20.com/ipl/IPLHeadshot2024/3118.png" },
    { name: "Suyash Prabhudessai", url: "https://documents.iplt20.com/ipl/IPLHeadshot2024/540.png" },
    { name: "Sonu Yadav", url: "https://documents.iplt20.com/ipl/IPLHeadshot2025/3125.png" },
    { name: "Reece Topley", url: "https://documents.iplt20.com/ipl/IPLHeadshot2023/386.png" },
    { name: "Piyush Chawla", url: "https://documents.iplt20.com/ipl/IPLHeadshot2023/36.png" },
    { name: "Siddharth Kaul", url: "https://documents.iplt20.com/ipl/IPLHeadshot2022/179.png" },
    { name: "C Andre Siddarth", url: "https://documents.iplt20.com/ipl/IPLHeadshot2025/3103.png" },
    { name: "Manimaran Siddharth", url: "https://documents.iplt20.com/ipl/IPLHeadshot2025/3762.png" },
    { name: "Varun Chakravarthy", url: "https://documents.iplt20.com/ipl/IPLHeadshot2024/544.png" },

    // Jake Fraser-McGurk variations
    { name: "Jake Fraser McGurk", url: "https://documents.iplt20.com/ipl/IPLHeadshot2024/3115.png" },
    { name: "Jake FraserMcGurk", url: "https://documents.iplt20.com/ipl/IPLHeadshot2024/3115.png" }
];

function toFilename(name) {
    return name.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '_') + '.png';
}

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        // Delete existing zero-size file first
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }

        const file = fs.createWriteStream(filepath);
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        }, (res) => {
            if (res.statusCode === 200 && res.headers['content-type']?.includes('image')) {
                res.pipe(file);
                file.on('finish', () => {
                    file.close();
                    const stats = fs.statSync(filepath);
                    if (stats.size > 1000) {
                        resolve({ success: true, size: stats.size });
                    } else {
                        fs.unlinkSync(filepath);
                        resolve({ success: false, error: 'Too small' });
                    }
                });
            } else {
                file.close();
                if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
                resolve({ success: false, error: `Status ${res.statusCode}` });
            }
        }).on('error', (e) => {
            file.close();
            if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
            resolve({ success: false, error: e.message });
        });
    });
}

async function main() {
    console.log('='.repeat(60));
    console.log('   Fixing Zero-Size Photo Files');
    console.log('='.repeat(60));

    // Find currently zero-size files
    const zeroSizeFiles = fs.readdirSync(PHOTO_DIR).filter(f => {
        try {
            const stat = fs.statSync(path.join(PHOTO_DIR, f));
            return f.endsWith('.png') && stat.size === 0;
        } catch {
            return false;
        }
    });

    console.log(`\nZero-size files found: ${zeroSizeFiles.length}`);
    zeroSizeFiles.forEach(f => console.log(`  - ${f.replace('.png', '').replace(/_/g, ' ')}`));

    console.log(`\nPlayers to download: ${PLAYERS_TO_FIX.length}\n`);

    let success = 0;
    let failed = 0;
    const failures = [];

    for (let i = 0; i < PLAYERS_TO_FIX.length; i++) {
        const player = PLAYERS_TO_FIX[i];
        const filename = toFilename(player.name);
        const filepath = path.join(PHOTO_DIR, filename);

        process.stdout.write(`[${i + 1}/${PLAYERS_TO_FIX.length}] ${player.name}... `);

        const result = await downloadImage(player.url, filepath);
        if (result.success) {
            console.log(`✓ (${Math.round(result.size / 1024)}KB)`);
            success++;
        } else {
            console.log(`✗ ${result.error}`);
            failures.push({ name: player.name, error: result.error });
            failed++;
        }

        await new Promise(r => setTimeout(r, 150));
    }

    console.log('\n' + '='.repeat(60));
    console.log(`Downloaded: ${success}`);
    console.log(`Failed: ${failed}`);

    if (failures.length > 0) {
        console.log('\nFailed downloads:');
        failures.forEach(f => console.log(`  - ${f.name}: ${f.error}`));
    }

    // Check remaining zero-size files
    const stillZero = fs.readdirSync(PHOTO_DIR).filter(f => {
        try {
            const stat = fs.statSync(path.join(PHOTO_DIR, f));
            return f.endsWith('.png') && stat.size === 0;
        } catch {
            return false;
        }
    });

    if (stillZero.length > 0) {
        console.log(`\nStill zero-size: ${stillZero.length}`);
        stillZero.forEach(f => console.log(`  - ${f.replace('.png', '').replace(/_/g, ' ')}`));
    }

    console.log('='.repeat(60));
}

main().catch(console.error);
