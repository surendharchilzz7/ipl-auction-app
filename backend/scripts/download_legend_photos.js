
const fs = require('fs');
const path = require('path');
const https = require('https');

const PLAYERS = {
    // 2008 Icons & Stars
    "Yusuf_Pathan": "https://upload.wikimedia.org/wikipedia/commons/1/10/Yusuf_Pathan_-_Kolkata_Knight_Riders.jpg",
    "Yuvraj_Singh": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Yuvraj_Singh_Canberra_2014.jpg/800px-Yuvraj_Singh_Canberra_2014.jpg",
    "Shane_Warne": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Shane_Warne_bowling.jpg/800px-Shane_Warne_bowling.jpg",
    "Adam_Gilchrist": "https://upload.wikimedia.org/wikipedia/commons/3/3e/Adam_Gilchrist_Waitangi_Day_2008.jpg",
    "Matthew_Hayden": "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Matthew_Hayden_2008.jpg/800px-Matthew_Hayden_2008.jpg",
    "Mike_Hussey": "https://upload.wikimedia.org/wikipedia/commons/5/52/Michael_Hussey.jpg",
    "Sanath_Jayasuriya": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Sanath_Jayasuriya_2011.jpg/800px-Sanath_Jayasuriya_2011.jpg",
    "Shaun_Pollock": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Shaun_Pollock.jpg/800px-Shaun_Pollock.jpg",
    "Sourav_Ganguly": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/Sourav_Ganguly_2008_IPL.jpg/800px-Sourav_Ganguly_2008_IPL.jpg",
    "Rahul_Dravid": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Rahul_Dravid.jpg/800px-Rahul_Dravid.jpg",
    "Anil_Kumble": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Anil_Kumble.jpg/800px-Anil_Kumble.jpg",
    "Virender_Sehwag": "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Virender_Sehwag_2011.jpg/800px-Virender_Sehwag_2011.jpg",
    "Gautam_Gambhir": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Gautam_Gambhir_in_2012.jpg/800px-Gautam_Gambhir_in_2012.jpg",
    "Andrew_Symonds": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Andrew_Symonds.jpg/800px-Andrew_Symonds.jpg",
    "Sachin_Tendulkar": "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Sachin_Tendulkar_at_MRF_Promotion_Event.jpg/800px-Sachin_Tendulkar_at_MRF_Promotion_Event.jpg",
    "Shoaib_Akhtar": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Shoaib_Akhtar_2008.jpg/800px-Shoaib_Akhtar_2008.jpg",
    "Brendon_McCullum": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Brendon_McCullum.jpg/800px-Brendon_McCullum.jpg",
    "Zaheer_Khan": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Zaheer_Khan.jpg/800px-Zaheer_Khan.jpg",
    "Harbhajan_Singh": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Harbhajan_Singh.jpg/800px-Harbhajan_Singh.jpg",
    "Muttiah_Muralitharan": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/61/Muttiah_Muralitharan_2011.jpg/800px-Muttiah_Muralitharan_2011.jpg",
    "Kumar_Sangakkara": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Kumar_Sangakkara.jpg/800px-Kumar_Sangakkara.jpg",
    "Mahela_Jayawardene": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Mahela_Jayawardene.jpg/800px-Mahela_Jayawardene.jpg",
    "Suresh_Raina": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/07/Suresh_Raina.jpg/800px-Suresh_Raina.jpg",
    "Makhaya_Ntini": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Makhaya_Ntini.jpg/800px-Makhaya_Ntini.jpg",
    "Brett_Lee": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Brett_Lee_2011.jpg/800px-Brett_Lee_2011.jpg",
    "Jacques_Kallis": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Jacques_Kallis.jpg/800px-Jacques_Kallis.jpg",
    "Graeme_Smith": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Graeme_Smith.jpg/800px-Graeme_Smith.jpg",
    "Ross_Taylor": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Ross_Taylor.jpg/800px-Ross_Taylor.jpg",
    "Albie_Morkel": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Albie_Morkel_2011.jpg/800px-Albie_Morkel_2011.jpg",
    "Sohail_Tanvir": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Sohail_Tanvir.jpg/800px-Sohail_Tanvir.jpg",
    "Lasith_Malinga": "https://upload.wikimedia.org/wikipedia/commons/1/14/Lasith_Malinga_MI.jpg",
    "Shahbaz_Nadeem": "https://static.cricbuzz.com/a/img/v1/152x152/i1/c17066/shahbaz-nadeem.jpg",
    "Aditya_Tare": "https://static.cricbuzz.com/a/img/v1/152x152/i1/c17094/aditya-tare.jpg",
    "Mandeep_Singh": "https://static.cricbuzz.com/a/img/v1/152x152/i1/c17098/mandeep-singh.jpg",
    "S_Sreesanth": "https://static.cricbuzz.com/a/img/v1/152x152/i1/c17094/s-sreesanth.jpg",
    "RP_Singh": "https://static.cricbuzz.com/a/img/v1/152x152/i1/c15320/rp-singh.jpg",
    "Pragyan_Ojha": "https://static.cricbuzz.com/a/img/v1/152x152/i1/c15330/pragyan-ojha.jpg",
    "Herschelle_Gibbs": "https://static.cricbuzz.com/a/img/v1/152x152/i1/c15336/herschelle-gibbs.jpg",
    "Dwayne_Bravo": "https://static.cricbuzz.com/a/img/v1/152x152/i1/c17096/dwayne-bravo.jpg",
    "S_Badrinath": "https://static.cricbuzz.com/a/img/v1/152x152/i1/c15322/subramaniam-badrinath.jpg"
};

const DEST_DIR = path.join(__dirname, '../../frontend/public/player-photos');

if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
}

async function download(url, filename) {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(path.join(DEST_DIR, filename));
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
            }
        };

        const request = https.get(url, options, (response) => {
            // Handle redirects
            if (response.statusCode === 301 || response.statusCode === 302) {
                file.close();
                fs.unlink(path.join(DEST_DIR, filename), () => { }); // incomplete file
                download(response.headers.location, filename).then(resolve).catch(reject);
                return;
            }

            if (response.statusCode !== 200) {
                fs.unlink(path.join(DEST_DIR, filename), () => { });
                reject(new Error(`Failed to download ${filename}: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                console.log(`Downloaded: ${filename}`);
                resolve();
            });
        });
        request.on('error', (err) => {
            fs.unlink(path.join(DEST_DIR, filename), () => { });
            console.error(`Error downloading ${filename}:`, err.message);
            reject(err);
        });
    });
}

async function main() {
    console.log("Downloading legend photos...");
    for (const [name, url] of Object.entries(PLAYERS)) {
        try {
            // Convert name_with_underscore to name with underscore.png
            const filename = `${name}.png`;
            await download(url, filename);
        } catch (e) {
            console.error(`Failed to download ${name}`);
        }
    }
}

main();
