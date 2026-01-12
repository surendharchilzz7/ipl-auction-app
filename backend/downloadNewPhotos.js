/**
 * Download new player photos from scraped data
 * Only downloads photos for players who don't already have them
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const PHOTO_DIR = path.join(__dirname, '../frontend/public/player-photos');

// Scraped player data from IPL website (161 players)
const scrapedPlayers = [
    { "name": "Rohit Sharma", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/6.png" },
    { "name": "Surya Kumar Yadav", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/174.png" },
    { "name": "Robin Minz", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3103.png" },
    { "name": "Ryan Rickelton", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/743.png" },
    { "name": "N. Tilak Varma", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/993.png" },
    { "name": "Hardik Pandya", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/54.png" },
    { "name": "Naman Dhir", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3107.png" },
    { "name": "Mitchell Santner", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/75.png" },
    { "name": "Raj Angad Bawa", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/781.png" },
    { "name": "Trent Boult", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/66.png" },
    { "name": "Deepak Chahar", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/91.png" },
    { "name": "Ashwani Kumar", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3569.png" },
    { "name": "Raghu Sharma", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3869.png" },
    { "name": "Jasprit Bumrah", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/9.png" },
    { "name": "Rajat Patidar", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/597.png" },
    { "name": "Devdutt Padikkal", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/200.png" },
    { "name": "Virat Kohli", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/2.png" },
    { "name": "Phil Salt", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/1220.png" },
    { "name": "Jitesh Sharma", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/1000.png" },
    { "name": "Krunal Pandya", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/17.png" },
    { "name": "Swapnil Singh", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/1483.png" },
    { "name": "Tim David", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/636.png" },
    { "name": "Romario Shepherd", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/371.png" },
    { "name": "Jacob Bethell", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/869.png" },
    { "name": "Josh Hazlewood", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/36.png" },
    { "name": "Rasikh Dar", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/172.png" },
    { "name": "Suyash Sharma", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/1932.png" },
    { "name": "Bhuvneshwar Kumar", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/15.png" },
    { "name": "Nuwan Thushara", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/813.png" },
    { "name": "Abhinandan Singh", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3574.png" },
    { "name": "Yash Dayal", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/978.png" },
    { "name": "Ajinkya Rahane", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/44.png" },
    { "name": "Rinku Singh", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/152.png" },
    { "name": "Angkrish Raghuvanshi", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/787.png" },
    { "name": "Manish Pandey", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/16.png" },
    { "name": "Rovman Powell", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/329.png" },
    { "name": "Anukul Roy", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/160.png" },
    { "name": "Ramandeep Singh", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/991.png" },
    { "name": "Vaibhav Arora", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/583.png" },
    { "name": "Harshit Rana", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/1013.png" },
    { "name": "Sunil Narine", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/156.png" },
    { "name": "Varun Chakaravarthy", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/140.png" },
    { "name": "Ishan Kishan", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/164.png" },
    { "name": "Aniket Verma", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3576.png" },
    { "name": "Smaran Ravichandran", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3752.png" },
    { "name": "Heinrich Klaasen", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/202.png" },
    { "name": "Travis Head", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/37.png" },
    { "name": "Harshal Patel", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/114.png" },
    { "name": "Kamindu Mendis", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/627.png" },
    { "name": "Harsh Dubey", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/1494.png" },
    { "name": "Abhishek Sharma", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/212.png" },
    { "name": "Nitish Kumar Reddy", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/1944.png" },
    { "name": "Pat Cummins", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/33.png" },
    { "name": "Zeeshan Ansari", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3575.png" },
    { "name": "Jaydev Unadkat", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/180.png" },
    { "name": "Eshan Malinga", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3339.png" },
    { "name": "Shubham Dubey", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3112.png" },
    { "name": "Vaibhav Suryavanshi", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3498.png" },
    { "name": "Lhuan-dre Pretorius", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/2827.png" },
    { "name": "Shimron Hetmyer", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/210.png" },
    { "name": "Yashasvi Jaiswal", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/533.png" },
    { "name": "Dhruv Jurel", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/1004.png" },
    { "name": "Riyan Parag", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/189.png" },
    { "name": "Yudhvir Singh Charak", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/587.png" },
    { "name": "Jofra Archer", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/181.png" },
    { "name": "Tushar Deshpande", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/539.png" },
    { "name": "Kwena Maphaka", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/801.png" },
    { "name": "Kuldeep Sen", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/1005.png" },
    { "name": "Sandeep Sharma", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/220.png" },
    { "name": "Nandre Burger", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/2806.png" },
    { "name": "KL Rahul", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/19.png" },
    { "name": "Karun Nair", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/131.png" },
    { "name": "Prithvi Shaw", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/51.png" },
    { "name": "Abishek Porel", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/1580.png" },
    { "name": "Tristan Stubbs", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/1017.png" },
    { "name": "Axar Patel", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/110.png" },
    { "name": "Sameer Rizvi", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/1229.png" },
    { "name": "Ashutosh Sharma", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3109.png" },
    { "name": "Vipraj Nigam", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3560.png" },
    { "name": "Ajay Mandal", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/1931.png" },
    { "name": "Tripurana Vijay", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3563.png" },
    { "name": "Madhav Tiwari", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3561.png" },
    { "name": "Mitchell Starc", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/31.png" },
    { "name": "T. Natarajan", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/224.png" },
    { "name": "Mukesh Kumar", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/1462.png" },
    { "name": "Dushmantha Chameera", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/608.png" },
    { "name": "Lungisani Ngidi", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2023/99.png" },
    { "name": "Kuldeep Yadav", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/14.png" },
    { "name": "Shreyas Iyer", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/12.png" },
    { "name": "Nehal Wadhera", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/1541.png" },
    { "name": "Vishnu Vinod", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/581.png" },
    { "name": "Harnoor Pannu", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/784.png" },
    { "name": "Pyla Avinash", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3573.png" },
    { "name": "Prabhsimran Singh", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/137.png" },
    { "name": "Shashank Singh", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/191.png" },
    { "name": "Marcus Stoinis", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/23.png" },
    { "name": "Harpreet Brar", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/130.png" },
    { "name": "Marco Jansen", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/586.png" },
    { "name": "Azmatullah Omarzai", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/1354.png" },
    { "name": "Priyansh Arya", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3571.png" },
    { "name": "Musheer Khan", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/2813.png" },
    { "name": "Suryansh Shedge", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/2146.png" },
    { "name": "Mitch Owen", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3870.png" },
    { "name": "Arshdeep Singh", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/125.png" },
    { "name": "Yuzvendra Chahal", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/10.png" },
    { "name": "Vyshak Vijaykumar", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/2034.png" },
    { "name": "Yash Thakur", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/1550.png" },
    { "name": "Xavier Bartlett", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3572.png" },
    { "name": "Pravin Dubey", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/548.png" },
    { "name": "Rishabh Pant", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/18.png" },
    { "name": "Aiden Markram", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/287.png" },
    { "name": "Himmat Singh", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/203.png" },
    { "name": "Matthew Breetzke", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/2805.png" },
    { "name": "Nicholas Pooran", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/136.png" },
    { "name": "Mitchell Marsh", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/40.png" },
    { "name": "Abdul Samad", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/525.png" },
    { "name": "Shahbaz Ahamad", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/523.png" },
    { "name": "Arshin Kulkarni", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/2788.png" },
    { "name": "Ayush Badoni", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/985.png" },
    { "name": "Avesh Khan", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/109.png" },
    { "name": "M. Siddharth", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/532.png" },
    { "name": "Digvesh Singh", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3565.png" },
    { "name": "Akash Singh", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/535.png" },
    { "name": "Prince Yadav", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/1225.png" },
    { "name": "Mayank Yadav", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/987.png" },
    { "name": "Mohsin Khan", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2024/541.png" },
    { "name": "Shubman Gill", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/62.png" },
    { "name": "Jos Buttler", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/182.png" },
    { "name": "Kumar Kushagra", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3101.png" },
    { "name": "Anuj Rawat", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/534.png" },
    { "name": "Glenn Phillips", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/635.png" },
    { "name": "Nishant Sindhu", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/791.png" },
    { "name": "Washington Sundar", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/20.png" },
    { "name": "Mohd. Arshad Khan", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/988.png" },
    { "name": "Sai Kishore", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/544.png" },
    { "name": "Jayant Yadav", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/165.png" },
    { "name": "Sai Sudharsan", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/976.png" },
    { "name": "Shahrukh Khan", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/590.png" },
    { "name": "Kagiso Rabada", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/116.png" },
    { "name": "Mohammed Siraj", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/63.png" },
    { "name": "Prasidh Krishna", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/150.png" },
    { "name": "Manav Suthar", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/2443.png" },
    { "name": "Gurnoor Singh Brar", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/1231.png" },
    { "name": "Ishant Sharma", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/50.png" },
    { "name": "Rahul Tewatia", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/120.png" },
    { "name": "Rashid Khan", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/218.png" },
    { "name": "MS Dhoni", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/57.png" },
    { "name": "Ruturaj Gaikwad", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/102.png" },
    { "name": "Dewald Brevis", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/797.png" },
    { "name": "Ayush Mhatre", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3497.png" },
    { "name": "Urvil Patel", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/1486.png" },
    { "name": "Anshul Kamboj", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3106.png" },
    { "name": "Jamie Overton", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/1216.png" },
    { "name": "Ramakrishna Ghosh", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/3559.png" },
    { "name": "Shivam Dube", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/211.png" },
    { "name": "Khaleel Ahmed", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/8.png" },
    { "name": "Noor Ahmad", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/975.png" },
    { "name": "Mukesh Choudhary", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/970.png" },
    { "name": "Nathan Ellis", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/633.png" },
    { "name": "Shreyas Gopal", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/192.png" },
    { "name": "Gurjapneet Singh", "imageUrl": "https://documents.iplt20.com/ipl/IPLHeadshot2025/2256.png" }
];

// Create filename from player name
function toFilename(name) {
    return name.replace(/[^a-zA-Z0-9 ]/g, '').replace(/ /g, '_') + '.png';
}

// Get existing photos
function getExistingPhotos() {
    const photos = new Set();
    const files = fs.readdirSync(PHOTO_DIR).filter(f => f.endsWith('.png'));
    for (const file of files) {
        const name = file.replace('.png', '').replace(/_/g, ' ').toLowerCase();
        photos.add(name);
    }
    return photos;
}

// Download image
function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
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
                        resolve(true);
                    } else {
                        fs.unlinkSync(filepath);
                        resolve(false);
                    }
                });
            } else {
                file.close();
                if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
                resolve(false);
            }
        }).on('error', () => {
            file.close();
            if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
            resolve(false);
        });
    });
}

async function main() {
    console.log('='.repeat(50));
    console.log('   Download New Player Photos (Correct Mapping)');
    console.log('='.repeat(50));

    const existing = getExistingPhotos();
    console.log(`\nExisting photos: ${existing.size}`);
    console.log(`Scraped players: ${scrapedPlayers.length}`);

    // Filter to only new players
    const toDownload = scrapedPlayers.filter(p => !existing.has(p.name.toLowerCase()));
    console.log(`New players to download: ${toDownload.length}\n`);

    if (toDownload.length === 0) {
        console.log('All players already have photos!');
        return;
    }

    console.log('Downloading...\n');
    let success = 0;
    let failed = 0;

    for (let i = 0; i < toDownload.length; i++) {
        const player = toDownload[i];
        const filename = toFilename(player.name);
        const filepath = path.join(PHOTO_DIR, filename);

        process.stdout.write(`[${i + 1}/${toDownload.length}] ${player.name}... `);

        const result = await downloadImage(player.imageUrl, filepath);
        if (result) {
            console.log('✓');
            success++;
        } else {
            console.log('✗');
            failed++;
        }

        // Small delay between downloads
        await new Promise(r => setTimeout(r, 100));
    }

    console.log('\n' + '='.repeat(50));
    console.log(`Downloaded: ${success}`);
    console.log(`Failed: ${failed}`);
    console.log('='.repeat(50));

    // Regenerate mapping
    console.log('\nRegenerating mapping files...');

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
    console.log(`Updated mapping.json with ${Object.keys(mapping).length} players`);

    // Generate playerPhotos.js
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
    console.log(`Updated playerPhotos.js with ${Object.keys(mapping).length} players`);

    console.log('\n✅ Done!');
}

main().catch(console.error);
