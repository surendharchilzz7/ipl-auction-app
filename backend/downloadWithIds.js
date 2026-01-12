/**
 * IPL Player Photo Downloader - With Known Headshot IDs
 * 
 * This script downloads IPL player photos using known ID-to-Name mappings from the IPL website.
 * The headshot URL pattern: https://documents.iplt20.com/ipl/IPLHeadshot2024/{id}.png
 * 
 * Run with: node downloadWithIds.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Output directory
const OUTPUT_DIR = path.join(__dirname, '../frontend/public/player-photos');

// Known IPL player headshot IDs scraped from iplt20.com (Season 2024/2025)
// Format: { name: "PLAYER NAME", id: "headshot_id" }
const KNOWN_PLAYERS = [
    // CSK Players
    { name: "MS Dhoni", id: "57" },
    { name: "Ruturaj Gaikwad", id: "102" },
    { name: "Ravindra Jadeja", id: "9" },
    { name: "Shivam Dube", id: "211" },
    { name: "Matheesha Pathirana", id: "768" },
    { name: "Devon Conway", id: "596" },
    { name: "Tushar Deshpande", id: "203" },
    { name: "Deepak Chahar", id: "148" },
    { name: "Mitchell Santner", id: "389" },
    { name: "Moeen Ali", id: "402" },
    { name: "Ajinkya Rahane", id: "14" },
    { name: "Rachin Ravindra", id: "845" },
    { name: "Simarjeet Singh", id: "632" },
    { name: "Avanish Rao Aravelly", id: "777" },
    { name: "Mukesh Choudhary", id: "730" },
    { name: "Prashant Solanki", id: "657" },
    { name: "Shaik Rasheed", id: "773" },
    { name: "Nishant Sindhu", id: "779" },
    { name: "Sameer Rizvi", id: "3471" },
    { name: "Mustafizur Rahman", id: "393" },
    { name: "Daryl Mitchell", id: "541" },
    { name: "Maheesh Theekshana", id: "627" },
    { name: "Sanju Samson", id: "190" },
    { name: "Sarfaraz Khan", id: "1564" },
    { name: "Dewald Brevis", id: "797" },
    { name: "Ayush Mhatre", id: "3497" },
    { name: "Urvil Patel", id: "1486" },
    { name: "Anshul Kamboj", id: "3415" },
    { name: "Jamie Overton", id: "3488" },
    { name: "Ramakrishna Ghosh", id: "3491" },

    // MI Players
    { name: "Rohit Sharma", id: "6" },
    { name: "Jasprit Bumrah", id: "8" },
    { name: "Suryakumar Yadav", id: "174" },
    { name: "Hardik Pandya", id: "54" },
    { name: "Ishan Kishan", id: "178" },
    { name: "Tilak Varma", id: "729" },
    { name: "Tim David", id: "714" },
    { name: "Nehal Wadhera", id: "780" },
    { name: "Gerald Coetzee", id: "836" },
    { name: "Piyush Chawla", id: "22" },
    { name: "Nuwan Thushara", id: "758" },
    { name: "Romario Shepherd", id: "570" },
    { name: "Akash Madhwal", id: "776" },
    { name: "Arjun Tendulkar", id: "712" },
    { name: "Naman Dhir", id: "3468" },
    { name: "Luke Wood", id: "813" },
    { name: "Mohammad Nabi", id: "398" },
    { name: "Vishnu Vinod", id: "722" },
    { name: "Dilshan Madushanka", id: "857" },
    { name: "Shams Mulani", id: "654" },
    { name: "Kumar Kartikeya", id: "774" },
    { name: "Trent Boult", id: "387" },
    { name: "Ryan Rickelton", id: "3508" },
    { name: "Deepak Chahar", id: "148" },
    { name: "Ashwani Kumar", id: "3464" },
    { name: "Karn Sharma", id: "81" },
    { name: "Will Jacks", id: "3400" },
    { name: "Reece Topley", id: "3516" },

    // RCB Players
    { name: "Virat Kohli", id: "2" },
    { name: "Rajat Patidar", id: "719" },
    { name: "Glenn Maxwell", id: "28" },
    { name: "Faf Du Plessis", id: "26" },
    { name: "Mohammed Siraj", id: "195" },
    { name: "Dinesh Karthik", id: "7" },
    { name: "Cameron Green", id: "817" },
    { name: "Anuj Rawat", id: "703" },
    { name: "Mahipal Lomror", id: "707" },
    { name: "Suyash Sharma", id: "778" },
    { name: "Will Jacks", id: "3400" },
    { name: "Alzarri Joseph", id: "545" },
    { name: "Yash Dayal", id: "715" },
    { name: "Karn Sharma", id: "81" },
    { name: "Rajan Kumar", id: "3475" },
    { name: "Lockie Ferguson", id: "455" },
    { name: "Akash Deep", id: "743" },
    { name: "Swapnil Singh", id: "662" },
    { name: "Himanshu Sharma", id: "724" },
    { name: "Reece Topley", id: "3516" },
    { name: "Mayank Dagar", id: "782" },
    { name: "Tom Curran", id: "469" },
    { name: "Liam Livingstone", id: "427" },
    { name: "Phil Salt", id: "565" },
    { name: "Jitesh Sharma", id: "733" },
    { name: "Devdutt Padikkal", id: "695" },
    { name: "Krunal Pandya", id: "176" },
    { name: "Tim David", id: "714" },
    { name: "Romario Shepherd", id: "570" },
    { name: "Josh Hazlewood", id: "35" },
    { name: "Lungi Ngidi", id: "477" },
    { name: "Saurav Chauhan", id: "3409" },
    { name: "Swastik Chikara", id: "3544" },
    { name: "Bhuvneshwar Kumar", id: "11" },
    { name: "Nuwan Thushara", id: "758" },
    { name: "Jacob Bethell", id: "3441" },

    // KKR Players
    { name: "Shreyas Iyer", id: "166" },
    { name: "Rinku Singh", id: "647" },
    { name: "Sunil Narine", id: "36" },
    { name: "Andre Russell", id: "177" },
    { name: "Venkatesh Iyer", id: "704" },
    { name: "Varun Chakravarthy", id: "629" },
    { name: "Nitish Rana", id: "196" },
    { name: "Phil Salt", id: "565" },
    { name: "Suyash Sharma", id: "778" },
    { name: "Ramandeep Singh", id: "705" },
    { name: "Manish Pandey", id: "69" },
    { name: "Harshit Rana", id: "775" },
    { name: "Vaibhav Arora", id: "721" },
    { name: "Chetan Sakariya", id: "702" },
    { name: "Dushmantha Chameera", id: "482" },
    { name: "Sherfane Rutherford", id: "514" },
    { name: "Angkrish Raghuvanshi", id: "3463" },
    { name: "Mitchell Starc", id: "39" },
    { name: "Starc", id: "39" },
    { name: "Gus Atkinson", id: "3436" },
    { name: "Sakib Hussain", id: "1523" },
    { name: "Spencer Johnson", id: "3493" },
    { name: "Moeen Ali", id: "402" },
    { name: "Quinton De Kock", id: "27" },
    { name: "Rahmanullah Gurbaz", id: "561" },
    { name: "Anrich Nortje", id: "498" },
    { name: "Ajinkya Rahane", id: "14" },
    { name: "Rovman Powell", id: "516" },

    // SRH Players
    { name: "Pat Cummins", id: "34" },
    { name: "Heinrich Klaasen", id: "447" },
    { name: "Abhishek Sharma", id: "701" },
    { name: "Travis Head", id: "579" },
    { name: "Nitish Kumar Reddy", id: "3467" },
    { name: "Rahul Tripathi", id: "197" },
    { name: "Abdul Samad", id: "671" },
    { name: "Bhuvneshwar Kumar", id: "11" },
    { name: "Washington Sundar", id: "198" },
    { name: "T Natarajan", id: "199" },
    { name: "Marco Jansen", id: "597" },
    { name: "Umran Malik", id: "727" },
    { name: "Shahbaz Ahmed", id: "726" },
    { name: "Aiden Markram", id: "458" },
    { name: "Mayank Agarwal", id: "168" },
    { name: "Glenn Phillips", id: "542" },
    { name: "Mayank Markande", id: "188" },
    { name: "Upendra Singh Yadav", id: "728" },
    { name: "Sanvir Singh", id: "644" },
    { name: "Mizba Syed Fahadulla", id: "1524" },
    { name: "Anmolpreet Singh", id: "693" },
    { name: "Jaydev Unadkat", id: "78" },
    { name: "Akash Singh", id: "1509" },
    { name: "Harshal Patel", id: "24" },
    { name: "Ishan Kishan", id: "178" },
    { name: "Mohammed Shami", id: "10" },
    { name: "Atharva Taide", id: "3548" },
    { name: "Adam Zampa", id: "466" },
    { name: "Kamindu Mendis", id: "3370" },
    { name: "Zeeshan Ansari", id: "3453" },
    { name: "Simarjeet Singh", id: "632" },
    { name: "Jayant Yadav", id: "140" },
    { name: "Aniket Verma", id: "3545" },

    // RR Players
    { name: "Sanju Samson", id: "190" },
    { name: "Yashasvi Jaiswal", id: "681" },
    { name: "Jos Buttler", id: "30" },
    { name: "Shimron Hetmyer", id: "373" },
    { name: "Trent Boult", id: "387" },
    { name: "Ravichandran Ashwin", id: "16" },
    { name: "Yuzvendra Chahal", id: "17" },
    { name: "Riyan Parag", id: "646" },
    { name: "Dhruv Jurel", id: "3466" },
    { name: "Prasidh Krishna", id: "620" },
    { name: "Kuldeep Sen", id: "731" },
    { name: "Navdeep Saini", id: "172" },
    { name: "Keshav Maharaj", id: "483" },
    { name: "Donovan Ferreira", id: "862" },
    { name: "Tanush Kotian", id: "655" },
    { name: "Kunal Rathore", id: "3439" },
    { name: "Avesh Khan", id: "181" },
    { name: "Sandeep Sharma", id: "105" },
    { name: "Rovman Powell", id: "516" },
    { name: "Abid Mushtaq", id: "664" },
    { name: "Nandre Burger", id: "862" },
    { name: "Maheesh Theekshana", id: "627" },
    { name: "Wanindu Hasaranga", id: "538" },
    { name: "Jofra Archer", id: "546" },
    { name: "Fazalhaq Farooqi", id: "651" },
    { name: "Kumar Kartikeya", id: "774" },
    { name: "Shubham Dubey", id: "3539" },
    { name: "Vaibhav Suryavanshi", id: "3562" },

    // DC Players
    { name: "Rishabh Pant", id: "18" },
    { name: "David Warner", id: "25" },
    { name: "KL Rahul", id: "19" },
    { name: "Axar Patel", id: "20" },
    { name: "Kuldeep Yadav", id: "71" },
    { name: "Prithvi Shaw", id: "182" },
    { name: "Anrich Nortje", id: "498" },
    { name: "Mitchell Marsh", id: "467" },
    { name: "Harry Brook", id: "823" },
    { name: "Jake Fraser McGurk", id: "868" },
    { name: "Tristan Stubbs", id: "816" },
    { name: "Abishek Porel", id: "783" },
    { name: "Ricky Bhui", id: "170" },
    { name: "Vicky Ostwal", id: "723" },
    { name: "Ishant Sharma", id: "13" },
    { name: "Jhye Richardson", id: "518" },
    { name: "Khaleel Ahmed", id: "184" },
    { name: "Lungi Ngidi", id: "477" },
    { name: "Mukesh Kumar", id: "734" },
    { name: "Rasikh Dar", id: "694" },
    { name: "Sumit Kumar", id: "706" },
    { name: "Pravin Dubey", id: "638" },
    { name: "Shai Hope", id: "577" },
    { name: "Mitchell Starc", id: "39" },
    { name: "T Natarajan", id: "199" },
    { name: "Faf Du Plessis", id: "26" },
    { name: "Karun Nair", id: "107" },
    { name: "Ashutosh Sharma", id: "3461" },
    { name: "Sameer Rizvi", id: "3471" },
    { name: "Mohit Sharma", id: "126" },

    // PBKS Players  
    { name: "Shikhar Dhawan", id: "4" },
    { name: "Jonny Bairstow", id: "32" },
    { name: "Sam Curran", id: "496" },
    { name: "Liam Livingstone", id: "427" },
    { name: "Kagiso Rabada", id: "440" },
    { name: "Arshdeep Singh", id: "711" },
    { name: "Harpreet Brar", id: "618" },
    { name: "Jitesh Sharma", id: "733" },
    { name: "Prabhsimran Singh", id: "648" },
    { name: "Rishi Dhawan", id: "73" },
    { name: "Shashank Singh", id: "649" },
    { name: "Rahul Chahar", id: "191" },
    { name: "Atharva Taide", id: "3548" },
    { name: "Prince Choudhary", id: "1526" },
    { name: "Vidwath Kaverappa", id: "771" },
    { name: "Tanay Thyagarajann", id: "1525" },
    { name: "Sikandar Raza", id: "435" },
    { name: "Ashutosh Sharma", id: "3461" },
    { name: "Chris Woakes", id: "495" },
    { name: "Harshal Patel", id: "24" },
    { name: "Shreyas Iyer", id: "166" },
    { name: "Yuzvendra Chahal", id: "17" },
    { name: "Glenn Maxwell", id: "28" },
    { name: "Marcus Stoinis", id: "446" },
    { name: "Lockie Ferguson", id: "455" },
    { name: "Nehal Wadhera", id: "780" },
    { name: "Marco Jansen", id: "597" },
    { name: "Josh Inglis", id: "571" },
    { name: "Vijaykumar Vyshak", id: "1521" },
    { name: "Kuldeep Sen", id: "731" },
    { name: "Yash Thakur", id: "825" },
    { name: "Suryansh Shedge", id: "3542" },
    { name: "Priyansh Arya", id: "3472" },
    { name: "Pyla Avinash", id: "3559" },
    { name: "Harpreet Singh Bhatia", id: "650" },
    { name: "Aaron Hardie", id: "3496" },

    // LSG Players
    { name: "KL Rahul", id: "19" },
    { name: "Quinton De Kock", id: "27" },
    { name: "Nicholas Pooran", id: "374" },
    { name: "Marcus Stoinis", id: "446" },
    { name: "Krunal Pandya", id: "176" },
    { name: "Kyle Mayers", id: "584" },
    { name: "Deepak Hooda", id: "154" },
    { name: "Ayush Badoni", id: "710" },
    { name: "Ravi Bishnoi", id: "680" },
    { name: "Mohsin Khan", id: "735" },
    { name: "Mayank Yadav", id: "3469" },
    { name: "Shamar Joseph", id: "3500" },
    { name: "Matt Henry", id: "451" },
    { name: "Manimaran Siddharth", id: "3452" },
    { name: "Arshin Kulkarni", id: "3519" },
    { name: "Prerak Mankad", id: "3476" },
    { name: "Naveen Ul Haq", id: "562" },
    { name: "Yash Thakur", id: "825" },
    { name: "Amit Mishra", id: "23" },
    { name: "Shivam Mavi", id: "621" },
    { name: "Mark Wood", id: "490" },
    { name: "Devdutt Padikkal", id: "695" },
    { name: "Rishabh Pant", id: "18" },
    { name: "Aiden Markram", id: "458" },
    { name: "David Miller", id: "443" },
    { name: "Mitchell Marsh", id: "467" },
    { name: "Avesh Khan", id: "181" },
    { name: "Abdul Samad", id: "671" },
    { name: "Shahbaz Ahmed", id: "726" },
    { name: "Akash Deep", id: "743" },
    { name: "Digvesh Singh", id: "3452" },

    // GT Players
    { name: "Shubman Gill", id: "62" },
    { name: "Rashid Khan", id: "391" },
    { name: "Sai Sudharsan", id: "781" },
    { name: "Rahul Tewatia", id: "624" },
    { name: "Wriddhiman Saha", id: "49" },
    { name: "M Shahrukh Khan", id: "716" },
    { name: "David Miller", id: "443" },
    { name: "Kane Williamson", id: "33" },
    { name: "Vijay Shankar", id: "192" },
    { name: "Darshan Nalkande", id: "643" },
    { name: "Noor Ahmad", id: "758" },
    { name: "Azmatullah Omarzai", id: "858" },
    { name: "BR Sharath", id: "644" },
    { name: "Abhinav Manohar", id: "720" },
    { name: "Mohit Sharma", id: "126" },
    { name: "Umesh Yadav", id: "12" },
    { name: "Joshua Little", id: "604" },
    { name: "Spencer Johnson", id: "3493" },
    { name: "Manav Suthar", id: "3451" },
    { name: "Sai Kishore", id: "630" },
    { name: "Kartik Tyagi", id: "696" },
    { name: "Jayant Yadav", id: "140" },
    { name: "Jos Buttler", id: "30" },
    { name: "Kagiso Rabada", id: "440" },
    { name: "Mohammed Siraj", id: "195" },
    { name: "Prasidh Krishna", id: "620" },
    { name: "Anuj Rawat", id: "703" },
    { name: "Ishant Sharma", id: "13" },
    { name: "Washington Sundar", id: "198" },
    { name: "Gerald Coetzee", id: "836" },
    { name: "Sherfane Rutherford", id: "514" },
    { name: "Glenn Phillips", id: "542" },
    { name: "Mahipal Lomror", id: "707" },
    { name: "Kane Williamson", id: "33" },
    { name: "Ben Stokes", id: "31" },
    { name: "Steve Smith", id: "29" },
    { name: "Chris Gayle", id: "3" },
    { name: "AB De Villiers", id: "21" },
    { name: "Kieron Pollard", id: "42" },
    { name: "Dwayne Bravo", id: "37" },
    { name: "Brendon McCullum", id: "389" },
    { name: "Yuvraj Singh", id: "5" },
    { name: "Gautam Gambhir", id: "1" },
    { name: "Virender Sehwag", id: "145" },
    { name: "Suresh Raina", id: "15" },
    { name: "Dinesh Karthik", id: "7" },
    { name: "Dale Steyn", id: "38" },
    { name: "Morne Morkel", id: "47" },
    { name: "Imran Tahir", id: "41" },
    { name: "Michael Hussey", id: "363" },
    { name: "Chris Lynn", id: "406" },
    { name: "Aaron Finch", id: "474" },
    { name: "Matthew Wade", id: "517" },
    { name: "Jason Holder", id: "376" },
    { name: "Shakib Al Hasan", id: "392" },
    { name: "Tim Southee", id: "390" },
    { name: "Shardul Thakur", id: "193" },
    { name: "Hashim Amla", id: "405" },
    { name: "Adil Rashid", id: "399" },
    { name: "Ricky Ponting", id: "380" },
    { name: "Xavier Bartlett", id: "3531" },
];

// Create filename from player name
function createFilename(name) {
    return name.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '_') + '.png';
}

// Check if photo already exists
function photoExists(name) {
    const filename = createFilename(name);
    return fs.existsSync(path.join(OUTPUT_DIR, filename));
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

// Try multiple URL patterns to download a player photo
async function downloadPlayer(name, id) {
    const filename = createFilename(name);
    const filepath = path.join(OUTPUT_DIR, filename);

    // URL patterns to try
    const patterns = [
        `https://documents.iplt20.com/ipl/IPLHeadshot2025/${id}.png`,
        `https://documents.iplt20.com/ipl/IPLHeadshot2024/${id}.png`,
        `https://documents.iplt20.com/ipl/IPLHeadshot2023/${id}.png`,
    ];

    for (const url of patterns) {
        try {
            const success = await downloadImage(url, filepath);
            if (success) {
                return { success: true, url };
            }
        } catch (e) {
            // Continue to next pattern
        }
    }

    return { success: false };
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
    console.log('  IPL Player Photo Downloader - With Known IDs');
    console.log('='.repeat(60));

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Remove duplicates from the player list
    const uniquePlayers = new Map();
    for (const player of KNOWN_PLAYERS) {
        const key = player.name.toLowerCase();
        if (!uniquePlayers.has(key)) {
            uniquePlayers.set(key, player);
        }
    }

    console.log(`\n📊 Total unique players in list: ${uniquePlayers.size}\n`);

    // Filter out existing photos
    const existing = [];
    const toDownload = [];

    for (const [key, player] of uniquePlayers) {
        if (photoExists(player.name)) {
            existing.push(player.name);
        } else {
            toDownload.push(player);
        }
    }

    console.log(`📸 Existing photos: ${existing.length}`);
    console.log(`⬇️  To download: ${toDownload.length}`);
    console.log('\n🚀 Starting downloads...\n');

    // Download missing photos
    let downloaded = 0;
    let failed = 0;
    const failedPlayers = [];

    for (let i = 0; i < toDownload.length; i++) {
        const player = toDownload[i];
        const progress = `[${i + 1}/${toDownload.length}]`;

        process.stdout.write(`${progress} ${player.name}... `);

        const result = await downloadPlayer(player.name, player.id);

        if (result.success) {
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

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('                     SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ Already existed: ${existing.length}`);
    console.log(`✅ Downloaded: ${downloaded}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total photos: ${existing.length + downloaded}`);

    if (failedPlayers.length > 0 && failedPlayers.length <= 30) {
        console.log('\n⚠️  Failed players:');
        failedPlayers.forEach(name => console.log(`   - ${name}`));
    }

    // Generate mappings
    console.log('\n📝 Generating mapping files...');
    const mapping = generateMapping();
    generatePlayerPhotosJS(mapping);

    console.log('\n✅ Done!');
    console.log('='.repeat(60));
}

main().catch(console.error);
